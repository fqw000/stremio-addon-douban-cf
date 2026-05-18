import type { MetaDetail, WithCache } from "@stremio-addon/sdk";
import { eq } from "drizzle-orm";
import { type Env, Hono } from "hono";
import { doubanMapping } from "@/db";
import { api } from "@/libs/api";
import { getConfig } from "@/libs/config";
import { ImageUrlGenerator } from "@/libs/images";
import { matchResourceRoute } from "@/libs/router";
import { isForwardUserAgent } from "@/libs/utils";

export const metaRoute = new Hono<Env>();

export const idPrefixes = ["douban:"];
const idPrefixRegex = new RegExp(`^(${idPrefixes.join("|")})`);

metaRoute.get("*", async (c) => {
  const [matched, params] = matchResourceRoute(c.req.path);
  if (!matched) {
    return c.notFound();
  }
  const metaId = params.id;
  if (!idPrefixRegex.test(metaId)) {
    return c.notFound();
  }

  let doubanId: number | undefined;
  if (metaId.startsWith("douban:")) {
    doubanId = Number.parseInt(metaId.split(":")[1], 10);
  }
  if (!doubanId) {
    return c.notFound();
  }

  const data = await api.doubanAPI.getSubjectDetail(doubanId);
  if (!data) {
    return c.notFound();
  }

  const meta: MetaDetail & { [key: string]: any } = {
    id: metaId,
    type: data.type === "tv" ? "series" : "movie",
    name: data.title,
    description: data.intro ?? undefined,
    genres: data.genres ?? undefined,
    links: [
      { name: `豆瓣评分：${data.rating?.value ?? "N/A"}`, category: "douban", url: data.url ?? "" },
      ...data.linewatches.map((item) => ({
        name: item.source.name,
        category: "linewatches",
        url: item.source_uri ?? "",
      })),
      ...(data.directors ?? []).map((item) => ({ name: item.name, category: "director", url: "#" })),
      ...(data.actors ?? []).map((item) => ({ name: item.name, category: "actor", url: "#" })),
    ],
    language: data.languages?.join(" / "),
    country: data.countries?.join(" / "),
    awards: data.honor_infos?.map((item) => item.title).join(" / "),
  };
  meta.behaviorHints ||= {};
  const isInForward = isForwardUserAgent(c);

  const dbData = await api.db.query.doubanMapping.findFirst({ where: eq(doubanMapping.doubanId, doubanId) });
  if (!dbData) {
    c.executionCtx.waitUntil(api.db.insert(doubanMapping).values({ doubanId }));
  }

  // 重要：只从 dbData 中解构一次，不要重复声明
  let { tmdbId, imdbId } = dbData || {};

  // 后备映射逻辑：如果数据库中没有 imdbId，则实时获取
  if (!imdbId) {
    const externalId = await api.findExternalId({ 
      doubanId, 
      type: data.type === "tv" ? "tv" : "movie" 
    });
    if (externalId) {
      imdbId = externalId.imdbId;
      tmdbId = externalId.tmdbId;
      // 后台异步写入数据库，供下次使用
      c.executionCtx.waitUntil(
        api.persistIdMapping([{
          doubanId,
          imdbId: externalId.imdbId,
          tmdbId: externalId.tmdbId,
          traktId: externalId.traktId,
        }])
      );
    }
  }

  // 使用 tmdbId 和 imdbId 进行后续处理
  if (tmdbId) {
    if (isInForward) {
      meta.tmdb_id = `tmdb:${tmdbId}`;
    } else {
      meta.tmdbId = tmdbId;
    }
    meta.behaviorHints.defaultVideoId = `tmdb:${tmdbId}`;
  }

  if (imdbId) {
    meta.imdb_id = imdbId;
    meta.behaviorHints.defaultVideoId = imdbId;
    meta.id = imdbId;   // ✅ 关键修复
  }

  console.log('dbData:', dbData);
  console.log('tmdbId:', tmdbId, 'imdbId:', imdbId);

  const config = await getConfig(c.env, params.config);
  const imageUrlGenerator = new ImageUrlGenerator(config.imageProviders, {
    origin: new URL(c.req.url).origin,
    userId: params.config,
  });
  const images = await imageUrlGenerator.generate({
    doubanInfo: {
      cover: data.cover_url || data.pic?.large || data.pic?.normal || "",
      type: data.type,
    },
    tmdbId,
    imdbId,
  });
  meta.poster = images.poster;
  meta.background = images.background;
  meta.logo = images.logo;

  return c.json({
    meta,
  } satisfies WithCache<{ meta: MetaDetail }>);
});

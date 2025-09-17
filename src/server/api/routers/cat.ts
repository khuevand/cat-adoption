import { z } from "zod";
import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";
import { CatStatus, Sex } from '@prisma/client';
import type { Prisma } from "@prisma/client";

const catSchema = z.object({
  statuses: z.array(z.nativeEnum(CatStatus)).min(1).optional(),
  sexes: z.array(z.nativeEnum(Sex)).min(1).optional(),
  minAge: z.number().min(0).optional(),
  maxAge: z.number().min(0).optional(),
  breeds: z.array(z.string()).min(1).optional(),
  desexed: z.boolean().optional(),
  vaccinated: z.boolean().optional(),
  microchipped: z.boolean().optional(),
  q: z.string().min(1).optional(),
  sortBy: z.enum(['createdAt', 'ageMonths', 'name']).default("createdAt"),
  sortDir: z.enum(['asc', 'desc']).default("desc"),
  limit: z.number().int().min(1).max(100).default(24),
  cursor: z.string().uuid().optional(), 
})
export const catRouter = createTRPCRouter({
  getCatById: publicProcedure
    .input(z.object({ id: z.string()}))
    .query(async ({ ctx, input }) => {
      return await ctx.db.cat.findUnique({
        where: { id: input.id},
      });
    }),
  
  getAllCats: publicProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.cat.findMany();
    }),
  
  listCats: publicProcedure
    .input(catSchema)
    .query(async ({ ctx, input }) => {
      const {
        statuses,
        sexes,
        minAge,
        maxAge,
        breeds,
        desexed,
        vaccinated,
        q,
        sortBy,
        sortDir,
        limit,
        cursor,
      } = input;

      const where: Prisma.CatWhereInput = {
        ...(statuses && { status: { in: statuses } }),
        ...(sexes && { sex: { in: sexes } }),
        ...((minAge !== undefined || maxAge !== undefined) && {
          ageMonths: {
            ...(minAge !== undefined ? { gte: minAge } : {}),
            ...(maxAge !== undefined ? { lte: maxAge } : {}),
          },
        }),
        ...(breeds && {breed: { in: breeds }}),
        ...(desexed !== undefined && { desexed }),
        ...(vaccinated !== undefined && { vaccinated }),
        ...(q && {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
          ],
        }),
      };

      const items = await ctx.db.cat.findMany({
        where,
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        orderBy: { [sortBy]: sortDir },
        select: {
          id: true,
          name: true,
          sex: true,
          ageMonths: true,
          desexed: true,
          vaccinated: true,
          status: true,
          primaryImageUrl: true,
          createdAt: true,
        },
      });

      const hasMore = items.length > limit;
      const trimmed = hasMore ? items.slice(0, -1) : items;
      const nextCursor = hasMore ? trimmed[trimmed.length - 1]?.id : undefined;

      return { items: trimmed, nextCursor };
    }),
});

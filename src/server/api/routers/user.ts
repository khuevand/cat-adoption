import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getUserById: protectedProcedure
    .input(z.object({ id: z.string()}))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        }
      });
      return user;
    }),

  getAllUsers: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        }
      })
    }),

  getDonation: protectedProcedure
    .input(z.object({ userId: z.string()}))
    .query(async ({ ctx, input}) => {
      return await ctx.db.user.findMany({
        where: {
          id: input.userId
        },
        select: {
          totalDonation: true
        }
      });
    }),
  
  getApplication: protectedProcedure
    .input(z.object({ userId: z.string()}))
    .query(async ({ctx, input}) => {
      return await ctx.db.application.findMany({
        where: {
          userId: input.userId
        },
        select: {
          id: true,
          catId: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      });
    })
});
import { z } from "zod";
import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  me: publicProcedure 
    .query(async ({ctx}) => {
      if (!ctx.currentUser) return null;
      return await ctx.db.user.findUnique({
        where: {id: ctx.currentUser.id},
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        }
      })
    }),

  getUserById: privateProcedure
    .input(z.object({ id: z.string()}))
    .query(async ({ ctx, input }) => {
      if (!ctx.currentUser) return;
      const user = await ctx.db.user.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        }
      });
      return user;
    }),

  getAllUsers: privateProcedure
    .query(async ({ ctx }) => {
      if (!ctx.currentUser) return;
      return await ctx.db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        }
      })
    }),

  getDonation: privateProcedure
    .input(z.object({ userId: z.string()}))
    .query(async ({ ctx, input}) => {
      if (!ctx.currentUser) return;
      return await ctx.db.user.findMany({
        where: {
          id: input.userId
        },
        select: {
          totalDonation: true
        }
      });
    }),
  
  getApplication: privateProcedure
    .input(z.object({ userId: z.string()}))
    .query(async ({ctx, input}) => {
      if (!ctx.currentUser) return;
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
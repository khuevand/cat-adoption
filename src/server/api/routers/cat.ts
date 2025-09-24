import { z } from "zod";
import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";
import { CatStatus, Sex } from '@prisma/client';
import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import cloudinary from "cloudinary";



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
  
  searchCats: publicProcedure
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
          createdAt: true,
        },
      });

      const hasMore = items.length > limit;
      const trimmed = hasMore ? items.slice(0, -1) : items;
      const nextCursor = hasMore ? trimmed[trimmed.length - 1]?.id : undefined;

      return { items: trimmed, nextCursor };
    }),

  createCat: privateProcedure
    .input(z.object({ 
      name: z.string().min(1), 
      ageMonths: z.number().min(0), 
      sex: z.nativeEnum(Sex), 
      breed: z.string().min(1), 
      vaccinated: z.boolean(), 
      desexed: z.boolean(), 
      microchipped: z.boolean(), 
      description: z.string().min(1),
      imageFiles: z.array(z.string()).optional().default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.currentUser;
      if (!user?.id || user.role !== "ADMIN") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      let imageUrls: string[] = [];

      if (input.imageFiles && input.imageFiles.length > 0) {
        for (let i = 0; i < input.imageFiles.length; i++) {
          const imageFile = input.imageFiles[i];
          if (!imageFile) {
            throw new Error("Image file is undefined");
          }

          const uploadResponse = await cloudinary.v2.uploader.upload(imageFile, {
            folder: "cats/images",
          });

          if (!uploadResponse.secure_url) {
            throw new Error("Failed to upload image to Cloudinary");
          }

          imageUrls.push(uploadResponse.secure_url);
        }
      }

      const cat = await ctx.db.cat.create({
        data: {
          name: input.name,
          ageMonths: input.ageMonths,
          breed: input.breed,
          sex: input.sex,
          desexed: input.desexed,
          vaccinated: input.vaccinated,
          microchipped: input.microchipped,
          description: input.description,
          images: imageUrls,
          listedBy: { connect: { id: user.id } },
        },
      });

      return cat;
    }),
  
  deleteCat: privateProcedure
    .input(z.object({catId: z.string()}))
    .mutation(async ({ctx, input}) => {
      const user = ctx.currentUser;
      if (!user?.id || user.role !== "ADMIN") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const existingCat = await ctx.db.cat.findUnique({
        where: { id: input.catId },
        select: { 
          listedByUserId: true,
          images: true,
          applications: {
            select: { id: true }
          }
        }
      });

      if (!existingCat) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cat not found" });
      }

      if (existingCat.listedByUserId !== user.id && user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete cats you created" });
      }

      if (existingCat.applications.length > 0) {
        throw new TRPCError({ 
          code: "CONFLICT", 
          message: "Cannot delete cat with existing applications" 
        });
      }

      if (existingCat.images.length > 0) {
        for (let i = 0; i < existingCat.images.length; i++) {
          const imageUrl = existingCat.images[i];
          if (!imageUrl) {
            throw new Error("Image file is undefined");
          }

          const publicId = imageUrl.split("/").pop()?.split(".")[0];
          
          if (publicId) {
            try {
              await cloudinary.v2.uploader.destroy(publicId); // Delete image from Cloudinary
            } catch (error) {
              console.error("Failed to delete image from Cloudinary:", error);
            }
          }

          await ctx.db.cat.delete({
            where: { id: input.catId },
          });

          return { message: "Cat deleted successfully" };
        }
      }
    }),
});

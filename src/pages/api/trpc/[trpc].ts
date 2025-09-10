import { createNextApiHandler } from "@trpc/server/adapters/next";
import { env } from "~/env";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import type { NextApiRequest, NextApiResponse } from "next";

// export API handler
const handler = createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
          );
        }
      : undefined,
});

// Export the handler with proper Next.js API route typing
export default async function trpcHandler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  await handler(req, res);
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
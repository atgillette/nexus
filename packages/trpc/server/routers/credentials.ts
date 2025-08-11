import { z } from "zod";
import { createTRPCRouter, clientProcedure } from "../trpc";
import { ServiceType } from "@prisma/client";
import { TRPCError } from "@trpc/server";

const serviceConfigSchema = z.object({
  // Slack
  workspaceUrl: z.string().optional(),
  botToken: z.string().optional(),
  signingSecret: z.string().optional(),
  
  // GitHub
  personalAccessToken: z.string().optional(),
  organization: z.string().optional(),
  
  // Jira
  domain: z.string().optional(),
  email: z.string().email().optional(),
  apiToken: z.string().optional(),
  
  // Salesforce
  instanceUrl: z.string().url().optional(),
  
  // AWS
  accessKeyId: z.string().optional(),
  secretAccessKey: z.string().optional(),
  region: z.string().optional(),
});

export const credentialsRouter = createTRPCRouter({
  getByCompany: clientProcedure
    .query(async ({ ctx }) => {
      const credentials = await ctx.db.credential.findMany({
        where: { companyId: ctx.companyId },
        orderBy: { service: "asc" },
      });
      
      // Mask sensitive fields before sending to client
      return credentials.map(cred => ({
        id: cred.id,
        name: cred.name,
        service: cred.service,
        companyId: cred.companyId,
        isActive: cred.isActive,
        isConnected: cred.isConnected,
        clientId: cred.clientId,
        clientSecret: cred.clientSecret ? "••••••••" : null,
        accessToken: cred.accessToken ? "••••••••" : null,
        refreshToken: cred.refreshToken ? "••••••••" : null,
        tokenExpiry: cred.tokenExpiry,
        lastUsedAt: cred.lastUsedAt,
        lastSyncAt: cred.lastSyncAt,
        createdAt: cred.createdAt,
        updatedAt: cred.updatedAt,
        createdBy: cred.createdBy,
        config: cred.config ? maskConfigSecrets(cred.config as any, cred.service) : {},
      }));
    }),

  getByService: clientProcedure
    .input(z.object({ 
      service: z.nativeEnum(ServiceType),
    }))
    .query(async ({ ctx, input }) => {
      const credential = await ctx.db.credential.findFirst({
        where: { 
          companyId: ctx.companyId,
          service: input.service,
        },
      });
      
      if (!credential) return null;
      
      // Mask sensitive fields
      return {
        id: credential.id,
        name: credential.name,
        service: credential.service,
        companyId: credential.companyId,
        isActive: credential.isActive,
        isConnected: credential.isConnected,
        clientId: credential.clientId,
        clientSecret: credential.clientSecret ? "••••••••" : null,
        accessToken: credential.accessToken ? "••••••••" : null,
        refreshToken: credential.refreshToken ? "••••••••" : null,
        tokenExpiry: credential.tokenExpiry,
        lastUsedAt: credential.lastUsedAt,
        lastSyncAt: credential.lastSyncAt,
        createdAt: credential.createdAt,
        updatedAt: credential.updatedAt,
        createdBy: credential.createdBy,
        config: credential.config ? maskConfigSecrets(credential.config as any, credential.service) : {},
      };
    }),

  upsert: clientProcedure
    .input(z.object({
      service: z.nativeEnum(ServiceType),
      name: z.string().default("Default"),
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
      accessToken: z.string().optional(),
      refreshToken: z.string().optional(),
      config: serviceConfigSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const { service, config, ...data } = input;
      
      // Check if credential exists
      const existing = await ctx.db.credential.findFirst({
        where: { companyId: ctx.companyId, service, name: input.name },
      });
      
      // Only update sensitive fields if they're not masked placeholders
      const updateData: any = {
        ...data,
        config: config as any,
        isConnected: true,
        lastSyncAt: new Date(),
      };
      
      // Don't update sensitive fields if they're masked
      if (data.clientSecret === "••••••••") delete updateData.clientSecret;
      if (data.accessToken === "••••••••") delete updateData.accessToken;
      if (data.refreshToken === "••••••••") delete updateData.refreshToken;
      
      // Clean up config to only include relevant fields for the service
      const cleanedConfig = cleanConfigForService(config, service);
      updateData.config = cleanedConfig;
      
      if (existing) {
        return await ctx.db.credential.update({
          where: { id: existing.id },
          data: updateData,
        });
      } else {
        return await ctx.db.credential.create({
          data: {
            companyId: ctx.companyId,
            service,
            name: input.name,
            ...updateData,
            createdBy: ctx.session.user.id,
          },
        });
      }
    }),

  delete: clientProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const credential = await ctx.db.credential.findFirst({
        where: { 
          id: input.id,
          companyId: ctx.companyId // Ensure user can only delete their own company's credentials
        },
      });
      
      if (!credential) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Credential not found",
        });
      }
      
      return await ctx.db.credential.delete({
        where: { id: input.id },
      });
    }),

  testConnection: clientProcedure
    .input(z.object({
      service: z.nativeEnum(ServiceType),
      config: serviceConfigSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement actual connection testing for each service
      // For now, just return success
      return { success: true, message: "Connection test successful" };
    }),
});

function maskConfigSecrets(config: any, service: ServiceType): any {
  const masked = { ...config };
  
  switch (service) {
    case "slack":
      if (masked.botToken) masked.botToken = "••••••••";
      if (masked.signingSecret) masked.signingSecret = "••••••••";
      break;
    case "github":
      if (masked.personalAccessToken) masked.personalAccessToken = "••••••••";
      break;
    case "jira":
      if (masked.apiToken) masked.apiToken = "••••••••";
      break;
    case "aws":
      if (masked.secretAccessKey) masked.secretAccessKey = "••••••••";
      break;
  }
  
  return masked;
}

function cleanConfigForService(config: any, service: ServiceType): any {
  switch (service) {
    case "slack":
      return {
        workspaceUrl: config.workspaceUrl || "",
        botToken: config.botToken || "",
        signingSecret: config.signingSecret || "",
      };
    case "github":
      return {
        personalAccessToken: config.personalAccessToken || "",
        organization: config.organization || "",
      };
    case "jira":
      return {
        domain: config.domain || "",
        email: config.email || "",
        apiToken: config.apiToken || "",
      };
    case "salesforce":
      return {
        instanceUrl: config.instanceUrl || "",
        domain: config.domain || "",
      };
    case "aws":
      return {
        accessKeyId: config.accessKeyId || "",
        secretAccessKey: config.secretAccessKey || "",
        region: config.region || "",
      };
    default:
      return {};
  }
}
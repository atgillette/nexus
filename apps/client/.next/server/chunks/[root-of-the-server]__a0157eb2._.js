module.exports = {

"[project]/apps/client/.next-internal/server/app/api/dashboard/route/actions.js [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}}),
"[project]/apps/client/app/api/dashboard/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "GET": ()=>GET
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
;
const prisma = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]();
async function GET() {
    try {
        // For now, we'll use the first client company's data
        // In a real app, this would be based on the authenticated user
        const clientCompany = await prisma.company.findFirst({
            include: {
                workflows: {
                    include: {
                        executions: {
                            orderBy: {
                                createdAt: 'desc'
                            },
                            take: 30 // Last 30 executions for ROI calc
                        }
                    }
                },
                users: true,
                billingUsage: true
            }
        });
        if (!clientCompany) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No client company found"
            }, {
                status: 404
            });
        }
        // Calculate ROI metrics
        const totalExecutions = clientCompany.workflows.reduce((sum, workflow)=>sum + workflow.executions.length, 0);
        const successfulExecutions = clientCompany.workflows.reduce((sum, workflow)=>sum + workflow.executions.filter((e)=>e.success).length, 0);
        const successRate = totalExecutions > 0 ? Math.round(successfulExecutions / totalExecutions * 100) : 0;
        // Mock ROI calculation: successful executions save $50 each on average
        const estimatedSavings = successfulExecutions * 50;
        // Get recent workflow executions with details
        const recentExecutions = clientCompany.workflows.flatMap((workflow)=>workflow.executions.map((execution)=>({
                    workflowName: workflow.name,
                    success: execution.success,
                    timestamp: execution.createdAt,
                    executionTime: execution.executionTime || 0
                }))).sort((a, b)=>new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
        // Get billing info
        const currentBilling = clientCompany.billingUsage[0] || {
            monthlyUsage: 0,
            monthlyLimit: 1000,
            costPerExecution: 2.50
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            company: {
                name: clientCompany.name,
                id: clientCompany.id
            },
            metrics: {
                activeWorkflows: clientCompany.workflows.filter((w)=>w.status === 'active').length,
                totalExecutions,
                successRate,
                estimatedSavings,
                averageExecutionTime: recentExecutions.length > 0 ? Math.round(recentExecutions.reduce((sum, e)=>sum + e.executionTime, 0) / recentExecutions.length) : 0
            },
            billing: {
                monthlyUsage: currentBilling.monthlyUsage,
                monthlyLimit: currentBilling.monthlyLimit,
                costPerExecution: currentBilling.costPerExecution,
                currentCost: currentBilling.monthlyUsage * currentBilling.costPerExecution
            },
            recentExecutions,
            workflows: clientCompany.workflows.map((workflow)=>({
                    id: workflow.id,
                    name: workflow.name,
                    status: workflow.status,
                    executionCount: workflow.executions.length,
                    lastExecution: workflow.executions[0]?.createdAt || null
                }))
        });
    } catch (error) {
        console.error("Client dashboard API error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch dashboard data"
        }, {
            status: 500
        });
    } finally{
        await prisma.$disconnect();
    }
}
}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__a0157eb2._.js.map
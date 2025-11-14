module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"001e7adb92e36870dfed460fb44f97ccd4dcfc1d46":"getAccessToken","0025086df839465ff99a254b0b1c49fe8750b3425f":"isAuthenticated","009fba23d3d9d892e37b5af7ac7cec2a9ec3af9c2e":"getOrRefreshToken","00b6223d3c4a36f0c20894a90142f9198778d76be2":"logout","00e77b38124e055331fcabb73e6b2889b51539a48b":"refreshAccessToken","60795e66f9c2da8845760b8758076457a78b2cae15":"authenticateWithCredentials"},"",""] */ __turbopack_context__.s([
    "authenticateWithCredentials",
    ()=>authenticateWithCredentials,
    "getAccessToken",
    ()=>getAccessToken,
    "getOrRefreshToken",
    ()=>getOrRefreshToken,
    "isAuthenticated",
    ()=>isAuthenticated,
    "logout",
    ()=>logout,
    "refreshAccessToken",
    ()=>refreshAccessToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-route] (ecmascript)");
;
;
const TOKEN_COOKIE_NAME = "bucket_access_token";
const TOKEN_EXPIRY_COOKIE_NAME = "bucket_token_expiry";
const CLIENT_ID_COOKIE_NAME = "bucket_client_id";
const CLIENT_SECRET_COOKIE_NAME = "bucket_client_secret";
async function isAuthenticated() {
    const token = await getAccessToken();
    return token !== null;
}
async function getAccessToken() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    const expiry = cookieStore.get(TOKEN_EXPIRY_COOKIE_NAME)?.value;
    console.log("[AUTH] getAccessToken - Cookie values:", {
        hasToken: !!token,
        tokenPreview: token?.substring(0, 20) + "...",
        expiry: expiry,
        expiryDate: expiry ? new Date(Number.parseInt(expiry)).toISOString() : null,
        currentTime: new Date().toISOString(),
        isExpired: expiry ? Date.now() >= Number.parseInt(expiry) : null
    });
    if (!token || !expiry) {
        console.log("[AUTH] getAccessToken - No token or expiry found");
        return null;
    }
    // Valida si el Token ya mamó
    if (Date.now() >= Number.parseInt(expiry)) {
        console.log("[AUTH] getAccessToken - Token expired");
        return null;
    }
    return token;
}
async function authenticateWithCredentials(clientId, clientSecret) {
    const apiUrl = ("TURBOPACK compile-time value", "http://127.0.0.1:8000");
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const response = await fetch(`${apiUrl}/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret
            })
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                return {
                    success: false,
                    error: "Credenciales inválidas"
                };
            }
            return {
                success: false,
                error: "Error al autenticar"
            };
        }
        const data = await response.json();
        console.log("[AUTH] Token recibido del backend:", {
            hasToken: !!data.access_token,
            tokenType: data.token_type,
            expiresIn: data.expires_in,
            tokenPreview: data.access_token?.substring(0, 20) + "..."
        });
        const expiresAt = Date.now() + data.expires_in * 1000;
        // Guarda las credenciales y el token en Cookies
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        cookieStore.set(CLIENT_ID_COOKIE_NAME, clientId, {
            httpOnly: true,
            secure: ("TURBOPACK compile-time value", "development") === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30
        });
        cookieStore.set(CLIENT_SECRET_COOKIE_NAME, clientSecret, {
            httpOnly: true,
            secure: ("TURBOPACK compile-time value", "development") === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30
        });
        cookieStore.set(TOKEN_COOKIE_NAME, data.access_token, {
            httpOnly: true,
            secure: ("TURBOPACK compile-time value", "development") === "production",
            sameSite: "lax",
            maxAge: data.expires_in
        });
        cookieStore.set(TOKEN_EXPIRY_COOKIE_NAME, expiresAt.toString(), {
            httpOnly: true,
            secure: ("TURBOPACK compile-time value", "development") === "production",
            sameSite: "lax",
            maxAge: data.expires_in
        });
        console.log("[AUTH] Token almacenado en cookies exitosamente");
        return {
            success: true
        };
    } catch (error) {
        console.error(" Error de autenticación:", error);
        return {
            success: false,
            error: "Error de conexión"
        };
    }
}
async function logout() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.delete(TOKEN_COOKIE_NAME);
    cookieStore.delete(TOKEN_EXPIRY_COOKIE_NAME);
    cookieStore.delete(CLIENT_ID_COOKIE_NAME);
    cookieStore.delete(CLIENT_SECRET_COOKIE_NAME);
}
async function refreshAccessToken() {
    console.log("[AUTH] refreshAccessToken - Starting refresh...");
    const apiUrl = ("TURBOPACK compile-time value", "http://127.0.0.1:8000");
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const clientId = cookieStore.get(CLIENT_ID_COOKIE_NAME)?.value;
    const clientSecret = cookieStore.get(CLIENT_SECRET_COOKIE_NAME)?.value;
    console.log("[AUTH] refreshAccessToken - Credentials:", {
        hasApiUrl: !!apiUrl,
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret
    });
    if (!apiUrl || !clientId || !clientSecret) {
        console.error("[AUTH] refreshAccessToken - Missing configuration");
        throw new Error("Configuración de autenticación faltante");
    }
    console.log("[AUTH] refreshAccessToken - Requesting new token from backend...");
    const response = await fetch(`${apiUrl}/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret
        })
    });
    if (!response.ok) {
        console.error("[AUTH] refreshAccessToken - Failed:", response.status);
        throw new Error("Error al obtener token de acceso");
    }
    const data = await response.json();
    console.log("[AUTH] refreshAccessToken - New token received:", {
        hasToken: !!data.access_token,
        tokenType: data.token_type,
        expiresIn: data.expires_in
    });
    const expiresAt = Date.now() + data.expires_in * 1000;
    // Definimos las Cookies
    cookieStore.set(TOKEN_COOKIE_NAME, data.access_token, {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") === "production",
        sameSite: "lax",
        maxAge: data.expires_in
    });
    cookieStore.set(TOKEN_EXPIRY_COOKIE_NAME, expiresAt.toString(), {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") === "production",
        sameSite: "lax",
        maxAge: data.expires_in
    });
    return data.access_token;
}
async function getOrRefreshToken() {
    let token = await getAccessToken();
    console.log("[AUTH] Obteniendo token de las cookies:", {
        hasToken: !!token,
        tokenPreview: token?.substring(0, 20) + "..."
    });
    if (!token) {
        token = await refreshAccessToken();
    }
    if (!token) {
        throw new Error("No hay token de autenticación disponible");
    }
    return token;
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    isAuthenticated,
    getAccessToken,
    authenticateWithCredentials,
    logout,
    refreshAccessToken,
    getOrRefreshToken
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(isAuthenticated, "0025086df839465ff99a254b0b1c49fe8750b3425f", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(getAccessToken, "001e7adb92e36870dfed460fb44f97ccd4dcfc1d46", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(authenticateWithCredentials, "60795e66f9c2da8845760b8758076457a78b2cae15", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(logout, "00b6223d3c4a36f0c20894a90142f9198778d76be2", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(refreshAccessToken, "00e77b38124e055331fcabb73e6b2889b51539a48b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(getOrRefreshToken, "009fba23d3d9d892e37b5af7ac7cec2a9ec3af9c2e", null);
}),
"[project]/app/api/auth/token/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        console.log("[API /api/auth/token] Fetching token...");
        const token = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOrRefreshToken"])();
        console.log("[API /api/auth/token] Token actualizado:", {
            hasToken: !!token,
            tokenPreview: token?.substring(0, 20) + "..."
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            token
        });
    } catch (error) {
        console.error("[API /api/auth/token] Error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Error al obtener token"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7d25da7a._.js.map
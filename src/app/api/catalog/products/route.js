import getPublicCatalog from "@/lib/catalog/getPublicCatalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const data = await getPublicCatalog(Object.fromEntries(searchParams.entries()));

        return Response.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("PUBLIC CATALOG ERROR:", error);

        return Response.json(
            {
                success: false,
                message: "دریافت محصولات منو انجام نشد",
            },
            {
                status: 500,
            },
        );
    }
}

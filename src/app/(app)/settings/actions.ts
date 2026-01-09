'use server'

export async function getIntegrationsStatus() {
    return {
        gemini: !!process.env.GEMINI_API_KEY,
        resend: !!process.env.RESEND_API_KEY
    }
}

import { Resend } from "resend";
import { z } from "zod";

const passedMetricsSchema = z.object({
  hostname: z.string().min(3).optional(),
  cpu: z.number().min(0).max(100).optional(),
  memory: z.number().min(0).max(100).optional(),
  disk: z.number().min(0).max(100).optional(),
});

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendEmail = async (
  to: string,
  subject: string = "Monitoring Alert",
  html: string = "",
  metrics: typeof passedMetricsSchema
) => {
  try {
    const htmlContent = `
            <h1>Monitoring Alert from Green Servers</h1>
            <p>The following metrics have exceeded your defined thresholds:</p>
            <ul>
                ${
                  metrics.hostname
                    ? `<li><strong>Hostname:</strong> ${metrics.hostname}</li>`
                    : ""
                }
                ${
                  metrics.cpu !== undefined
                    ? `<li><strong>CPU Usage:</strong> ${metrics.cpu}%</li>`
                    : ""
                }
                ${
                  metrics.memory !== undefined
                    ? `<li><strong>Memory Usage:</strong> ${metrics.memory}%</li>`
                    : ""
                }
                ${
                  metrics.disk !== undefined
                    ? `<li><strong>Disk Usage:</strong> ${metrics.disk}%</li>`
                    : ""
                }
            </ul>
            <p>Please take the necessary actions to address these issues.</p>
        `;
    const email = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: htmlContent,
    });
    console.log("Email sent successfully:", email);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

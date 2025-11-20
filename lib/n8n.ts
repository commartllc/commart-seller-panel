// n8n Webhook integration utilities

interface WebhookPayload {
  event: string
  data: Record<string, unknown>
  timestamp: string
  seller_id: string
}

// Trigger n8n webhook for product updates
export async function triggerProductWebhook(
  event: 'created' | 'updated' | 'deleted',
  productData: Record<string, unknown>,
  sellerId: string
): Promise<boolean> {
  const webhookUrl = process.env.N8N_WEBHOOK_PRODUCT_UPDATE

  if (!webhookUrl) {
    console.warn('N8N_WEBHOOK_PRODUCT_UPDATE not configured')
    return false
  }

  const payload: WebhookPayload = {
    event: `product.${event}`,
    data: productData,
    timestamp: new Date().toISOString(),
    seller_id: sellerId
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error(`n8n webhook failed: ${response.status}`)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to trigger product webhook:', error)
    return false
  }
}

// Trigger n8n webhook for order status updates
export async function triggerOrderWebhook(
  event: 'created' | 'status_updated' | 'cancelled',
  orderData: Record<string, unknown>,
  sellerId: string
): Promise<boolean> {
  const webhookUrl = process.env.N8N_WEBHOOK_ORDER_UPDATE

  if (!webhookUrl) {
    console.warn('N8N_WEBHOOK_ORDER_UPDATE not configured')
    return false
  }

  const payload: WebhookPayload = {
    event: `order.${event}`,
    data: orderData,
    timestamp: new Date().toISOString(),
    seller_id: sellerId
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error(`n8n webhook failed: ${response.status}`)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to trigger order webhook:', error)
    return false
  }
}

// Generic webhook trigger for custom events
export async function triggerCustomWebhook(
  webhookUrl: string,
  event: string,
  data: Record<string, unknown>,
  sellerId: string
): Promise<boolean> {
  const payload: WebhookPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
    seller_id: sellerId
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    return response.ok
  } catch (error) {
    console.error('Failed to trigger custom webhook:', error)
    return false
  }
}

class RealtimeBroadcastService
  class << self
    # Broadcast an order update
    def broadcast_order_update(order)
      broadcast(
        type: 'order_update',
        order_id: order.id,
        status: order.status,
        customer_name: order.customer.name,
        updated_at: order.updated_at
      )
    end
    
    # Broadcast an inventory update
    def broadcast_inventory_update(product)
      broadcast(
        type: 'inventory_update',
        product_id: product.id,
        name: product.name,
        quantity: product.quantity,
        updated_at: product.updated_at
      )
    end
    
    # Broadcast an agent update
    def broadcast_agent_update(agent)
      broadcast(
        type: 'agent_update',
        agent_id: agent.id,
        name: agent.name,
        status: agent.status,
        updated_at: agent.updated_at
      )
    end
    
    # Broadcast a callback notification
    def broadcast_callback_notification(callback)
      broadcast(
        type: 'callback_notification',
        callback_id: callback.id,
        customer_name: callback.customer.name,
        scheduled_at: callback.scheduled_at,
        agent_name: callback.agent&.name
      )
    end
    
    private
    
    # Send the broadcast to the realtime channel
    def broadcast(data)
      ActionCable.server.broadcast('realtime_channel', data)
    end
  end
end
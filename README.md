# CRM AutoXpress

A comprehensive Customer Relationship Management system for automotive parts businesses, built with Rails, esbuild, and Tailwind CSS.

## Core Features

### Order Management
- Customer orders
- Order processing
- Status tracking

### Dispatching/Order Processing
- Payment processing
- Supplier management
- Fulfillment

### Callbacks
- Customer follow-up system

### Agent Management
- Performance tracking
- Role-based access

### Product Catalog
- Automotive parts inventory

### Refunds/Returns
- Return processing workflow

### Supplier Management
- Vendor relationships
- Pricing management

### Dashboard/Analytics
- Real-time metrics
- Reporting

## Real-Time Features

- Live order status updates
- Real-time agent performance metrics
- Instant callback notifications
- Live inventory updates
- Real-time dashboard charts

## Real-Time Implementation

We've implemented Action Cable for real-time communication throughout the application. The system supports live updates for models like AgentCallback with automatic UI updates and notifications.

### Files Structure

- **Channels**
  - `app/channels/realtime_channel.rb` - Main Action Cable channel for broadcasting all real-time updates
  - `app/channels/application_cable/connection.rb` - Connection configuration

- **JavaScript Client**
  - `app/javascript/channels/realtime_channel.js` - Client-side subscription with handlers for different update types
  - `app/javascript/channels/consumer.js` - Action Cable consumer setup
  - `app/javascript/channels/index.js` - Channel imports (CRITICAL: Only import existing files!)

- **Services**
  - `app/services/realtime_broadcast_service.rb` - Utility service for broadcasting different types of updates

### Adding Real-Time to Any Model

Follow this step-by-step guide to add real-time functionality to any model:

#### Step 1: Add Broadcast Methods to Your Model

```ruby
# Example: app/models/your_model.rb
class YourModel < ApplicationRecord
  after_create_commit :broadcast_created
  after_update_commit :broadcast_updated
  after_destroy_commit :broadcast_destroyed

  private

  def broadcast_created
    ActionCable.server.broadcast('realtime_channel', {
      room: 'your_models',  # Use plural form of your model
      action: 'created',
      data: self.as_json
    })
  end

  def broadcast_updated
    ActionCable.server.broadcast('realtime_channel', {
      room: 'your_models',
      action: 'updated', 
      data: self.as_json
    })
  end

  def broadcast_destroyed
    ActionCable.server.broadcast('realtime_channel', {
      room: 'your_models',
      action: 'destroyed',
      data: { id: id }
    })
  end
end
```

#### Step 2: Add JavaScript Handlers to Realtime Channel

Add your model's handlers to `app/javascript/channels/realtime_channel.js`:

```javascript
received(data) {
  console.log("Received realtime data:", data)
  
  if (data.room === 'your_models') {
    this.handleYourModelUpdate(data)
  } else if (data.room === 'agent_callbacks') {
    this.handleAgentCallbackUpdate(data)
  }
  // ... other handlers
},

// Add your model handlers
handleYourModelUpdate(data) {
  const { action, data: modelData } = data
  
  switch(action) {
    case 'created':
      this.handleYourModelCreated(modelData)
      break
    case 'updated':
      this.handleYourModelUpdated(modelData)
      break
    case 'destroyed':
      this.handleYourModelDestroyed(modelData)
      break
  }
},

handleYourModelCreated(model) {
  // Add your UI update logic here
  console.log("Model created:", model)
  this.showNotification(`New ${model.name} created`, 'success')
},

handleYourModelUpdated(model) {
  // Add your UI update logic here  
  console.log("Model updated:", model)
  this.showNotification(`${model.name} updated`, 'info')
},

handleYourModelDestroyed(data) {
  // Add your UI update logic here
  console.log("Model destroyed:", data)
  this.showNotification('Record deleted', 'warning')
}
```

#### Step 3: Add Data Attributes to Your Views

For table-based UIs, add `data-model-id` attributes to enable updates:

```erb
<!-- app/views/your_models/index.html.erb -->
<tbody id="your-models-list">
  <% @your_models.each do |model| %>
    <tr data-your-model-id="<%= model.id %>">
      <!-- Your table content -->
    </tr>
  <% end %>
</tbody>
```

#### Step 4: Test and Debug

1. **Check Browser Console**: Open DevTools and look for:
   - "Connected to realtime channel" (connection successful)
   - "Received realtime data: ..." (broadcasts received)
   - Any JavaScript errors

2. **Check Rails Logs**: Look for ActionCable broadcast messages:
   ```
   [ActionCable] Broadcasting to realtime_channel: {:room=>"your_models", :action=>"created", ...}
   ```

3. **Verify Imports**: Ensure `app/javascript/channels/index.js` only imports existing files:
   ```javascript
   // ✅ Good: Only import files that exist
   import "./realtime_channel"
   
   // ❌ Bad: Importing non-existent files breaks everything
   import "./nonexistent_channel"  // This will break all channels!
   ```

### Common Issues and Solutions

#### Issue: Real-time not working
**Solution**: Check these in order:

1. **JavaScript Import Errors**: The #1 cause of real-time failures
   - Verify all imports in `app/javascript/channels/index.js` point to existing files
   - Check browser console for import/syntax errors
   - A single bad import breaks the entire channel system

2. **Missing Data Attributes**: JavaScript can't find elements to update
   - Add `data-model-id="<%= model.id %>"` to your table rows or elements
   - Use the correct selector in your JavaScript handlers

3. **Wrong Room Name**: Data broadcasts but JavaScript doesn't handle it
   - Ensure model broadcasts use consistent room names (e.g., 'agent_callbacks')
   - Match the room name exactly in your JavaScript `if (data.room === 'your_models')` check

4. **ActionCable Connection Issues**:
   - Check that ActionCable is properly mounted in `config/routes.rb`
   - Verify WebSocket connection in browser DevTools > Network > WS tab

#### Issue: Console shows broadcasts but no UI updates
- The JavaScript is not connected or has errors
- Check browser console for connection messages and errors
- Verify the realtime_channel.js is being imported correctly

#### Issue: JavaScript errors about missing elements  
- Add proper data attributes to your HTML elements
- Use `document.getElementById()` or `document.querySelector()` to verify elements exist

### Message Formats

#### Legacy Format (for backward compatibility)
```ruby
# Using RealtimeBroadcastService methods
RealtimeBroadcastService.broadcast_order_update(order)
```

#### New Format (recommended for new models)
```ruby
# Direct ActionCable broadcast with room-based routing
ActionCable.server.broadcast('realtime_channel', {
  room: 'your_models',
  action: 'created',
  data: model.as_json
})
```

### Working Example: AgentCallback

See the AgentCallback model implementation for a complete working example:
- Model: `app/models/agent_callback.rb` (broadcast methods)
- JavaScript: `app/javascript/channels/realtime_channel.js` (handlers)
- Views: `app/views/agent_callbacks/index.html.erb` (data attributes)

## Development

### Ruby version

### System dependencies

### Configuration

### Database creation

### Database initialization

### How to run the test suite

### Services (job queues, cache servers, search engines, etc.)

### Deployment instructions
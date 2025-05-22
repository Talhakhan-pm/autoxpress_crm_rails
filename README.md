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

We've implemented Action Cable for real-time communication throughout the application. The core real-time functionality includes:

### Files Structure

- **Channels**
  - `app/channels/realtime_channel.rb` - Main Action Cable channel for broadcasting all real-time updates
  - `app/channels/application_cable/connection.rb` - Connection configuration with commented authentication logic for future implementation

- **JavaScript Client**
  - `app/javascript/channels/realtime_channel.js` - Client-side subscription with handlers for different update types
  - `app/javascript/channels/consumer.js` - Action Cable consumer setup
  - `app/javascript/channels/index.js` - Channel imports

- **Services**
  - `app/services/realtime_broadcast_service.rb` - Utility service for broadcasting different types of updates

### Broadcasting Messages

To broadcast a real-time update from any part of the application, use the `RealtimeBroadcastService`:

```ruby
# Example: Broadcasting an order update
RealtimeBroadcastService.broadcast_order_update(order)

# Example: Broadcasting an inventory update
RealtimeBroadcastService.broadcast_inventory_update(product)

# Example: Broadcasting an agent update
RealtimeBroadcastService.broadcast_agent_update(agent)

# Example: Broadcasting a callback notification
RealtimeBroadcastService.broadcast_callback_notification(callback)
```

### Message Types

The real-time system supports these message types:
- `order_update` - Updates about order status changes
- `inventory_update` - Updates about product inventory changes
- `agent_update` - Updates about agent status or performance
- `callback_notification` - Notifications about customer callbacks

## Development

### Ruby version

### System dependencies

### Configuration

### Database creation

### Database initialization

### How to run the test suite

### Services (job queues, cache servers, search engines, etc.)

### Deployment instructions
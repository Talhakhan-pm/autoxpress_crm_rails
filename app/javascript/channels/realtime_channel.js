import consumer from "./consumer"

consumer.subscriptions.create("RealtimeChannel", {
  connected() {
    console.log("Connected to realtime channel")
  },

  disconnected() {
    console.log("Disconnected from realtime channel")
  },

  received(data) {
    console.log("Received realtime data:", data)
    
    // Handle different types of realtime updates based on data.room or data.type
    if (data.room === 'agent_callbacks') {
      console.log("Processing agent callback update:", data)
      this.handleAgentCallbackUpdate(data)
    } else {
      // Handle legacy data.type format
      switch(data.type) {
        case 'order_update':
          this.handleOrderUpdate(data)
          break
        case 'inventory_update':
          this.handleInventoryUpdate(data)
          break
        case 'agent_update':
          this.handleAgentUpdate(data)
          break
        case 'callback_notification':
          this.handleCallbackNotification(data)
          break
        default:
          console.log("Unknown realtime data type:", data.type)
      }
    }
  },
  
  // Handler methods for different types of realtime updates
  handleOrderUpdate(data) {
    // To be implemented
    console.log("Order update received:", data)
  },
  
  handleInventoryUpdate(data) {
    // To be implemented
    console.log("Inventory update received:", data)
  },
  
  handleAgentUpdate(data) {
    // To be implemented
    console.log("Agent update received:", data)
  },
  
  handleCallbackNotification(data) {
    // To be implemented
    console.log("Callback notification received:", data)
  },

  // Agent Callback specific handlers
  handleAgentCallbackUpdate(data) {
    const { action, data: callbackData } = data
    
    switch(action) {
      case 'created':
        this.handleCallbackCreated(callbackData)
        break
      case 'updated':
        this.handleCallbackUpdated(callbackData)
        break
      case 'destroyed':
        this.handleCallbackDestroyed(callbackData)
        break
    }
  },

  handleCallbackCreated(callback) {
    console.log("Handling callback created:", callback)
    const callbacksList = document.getElementById('callbacks-list')
    console.log("Callbacks list element:", callbacksList)
    if (callbacksList) {
      const newRow = this.createCallbackRow(callback)
      console.log("Created new row HTML:", newRow)
      callbacksList.insertAdjacentHTML('afterbegin', newRow)
      
      // Show notification
      this.showNotification(`New callback created for ${callback.customer_name}`, 'success')
    } else {
      console.log("callbacks-list element not found")
    }
  },

  handleCallbackUpdated(callback) {
    const existingRow = document.querySelector(`tr[data-callback-id="${callback.id}"]`)
    if (existingRow) {
      const newRow = this.createCallbackRow(callback)
      existingRow.outerHTML = newRow
      
      // Show notification
      this.showNotification(`Callback for ${callback.customer_name} was updated`, 'info')
    }
  },

  handleCallbackDestroyed(data) {
    const existingRow = document.querySelector(`tr[data-callback-id="${data.id}"]`)
    if (existingRow) {
      existingRow.remove()
      
      // Show notification
      this.showNotification('Callback was deleted', 'warning')
    }
  },

  createCallbackRow(callback) {
    const statusClass = this.getStatusClass(callback.status)
    const followUpDate = callback.follow_up_date ? 
      new Date(callback.follow_up_date).toLocaleDateString() : 'Not set'
    
    return `
      <tr class="hover:bg-gray-50" data-callback-id="${callback.id}">
        <td class="px-6 py-4 whitespace-nowrap">
          <div>
            <div class="text-sm font-medium text-gray-900">${callback.customer_name}</div>
            <div class="text-sm text-gray-500">${callback.callback_number}</div>
            <div class="text-sm text-gray-500">ZIP: ${callback.zip || ''}</div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${callback.product || ''}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${callback.car_make_model || ''}</div>
          <div class="text-sm text-gray-500">Year: ${callback.year || ''}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">
            ${callback.status ? callback.status.charAt(0).toUpperCase() + callback.status.slice(1).replace('_', ' ') : ''}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${followUpDate}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${callback.agent_name || ''}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
          <a href="/agent_callbacks/${callback.id}" class="text-blue-600 hover:text-blue-900">View</a>
          <a href="/agent_callbacks/${callback.id}/edit" class="text-indigo-600 hover:text-indigo-900">Edit</a>
          <a href="/agent_callbacks/${callback.id}" data-method="delete" data-confirm="Are you sure?" class="text-red-600 hover:text-red-900">Delete</a>
        </td>
      </tr>
    `
  },

  getStatusClass(status) {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  },

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${this.getNotificationClass(type)}`
    notification.innerHTML = `
      <div class="flex items-center">
        <div class="flex-shrink-0">
          ${this.getNotificationIcon(type)}
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">${message}</p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button class="inline-flex text-gray-400 hover:text-gray-500" onclick="this.parentElement.parentElement.parentElement.remove()">
            <span class="sr-only">Close</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    `
    
    document.body.appendChild(notification)
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove()
      }
    }, 5000)
  },

  getNotificationClass(type) {
    switch(type) {
      case 'success':
        return 'bg-green-50 border border-green-200 text-green-800'
      case 'warning':
        return 'bg-yellow-50 border border-yellow-200 text-yellow-800'
      case 'error':
        return 'bg-red-50 border border-red-200 text-red-800'
      default:
        return 'bg-blue-50 border border-blue-200 text-blue-800'
    }
  },

  getNotificationIcon(type) {
    switch(type) {
      case 'success':
        return '<svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
      case 'warning':
        return '<svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>'
      case 'error':
        return '<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
      default:
        return '<svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>'
    }
  }
});
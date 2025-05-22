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
      new Date(callback.follow_up_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short', 
        day: 'numeric'
      }) : 'Not scheduled'
    
    const timeAgo = callback.follow_up_date ? 
      this.getTimeAgoText(callback.follow_up_date) : ''
    
    return `
      <tr class="hover:bg-gray-50 transition-colors duration-200 group" data-callback-id="${callback.id}">
        <!-- Customer Details -->
        <td class="px-6 py-4">
          <div class="flex items-center space-x-3">
            <div>
              <div class="text-sm font-semibold text-gray-900">${callback.customer_name}</div>
              <div class="text-sm text-blue-600 font-medium">
                <a href="tel:${callback.callback_number}" class="hover:text-blue-800 transition-colors duration-200">
                  📞 ${callback.callback_number}
                </a>
              </div>
              <div class="text-xs text-gray-500">
                <span class="inline-flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  ${callback.zip || 'No ZIP'}
                </span>
              </div>
            </div>
          </div>
        </td>

        <!-- Product Interest -->
        <td class="px-6 py-4">
          <div class="text-sm font-medium text-gray-900">${callback.product || 'General Inquiry'}</div>
          <div class="text-xs text-gray-500 mt-1">Product inquiry</div>
        </td>

        <!-- Vehicle Info -->
        <td class="px-6 py-4">
          <div class="text-sm font-medium text-gray-900">${callback.car_make_model || 'Not specified'}</div>
          <div class="text-xs text-gray-500">
            <span class="inline-flex items-center">
              <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              ${callback.year || 'Year N/A'}
            </span>
          </div>
        </td>

        <!-- Status -->
        <td class="px-6 py-4">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusClass}">
            <span class="w-1.5 h-1.5 rounded-full mr-2 ${this.getStatusDotClass(callback.status)}"></span>
            ${callback.status ? callback.status.charAt(0).toUpperCase() + callback.status.slice(1).replace('_', ' ') : 'Pending'}
          </span>
        </td>

        <!-- Follow-up Date -->
        <td class="px-6 py-4">
          <div class="text-sm text-gray-900">${followUpDate}</div>
          ${timeAgo ? `<div class="text-xs text-gray-500">${timeAgo}</div>` : ''}
        </td>

        <!-- Agent -->
        <td class="px-6 py-4">
          <div class="flex items-center space-x-2">
            <div class="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
              <span class="text-white text-xs font-bold">
                ${callback.agent_name ? callback.agent_name.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <div class="text-sm text-gray-900">${callback.agent_name ? callback.agent_name.split('@')[0] : 'Unassigned'}</div>
          </div>
        </td>

        <!-- Actions -->
        <td class="px-6 py-4">
          <div class="flex items-center space-x-2">
            <a href="/agent_callbacks/${callback.id}" class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200" title="View details">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </a>
            <a href="/agent_callbacks/${callback.id}/edit" class="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors duration-200" title="Edit callback">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </a>
            <a href="/agent_callbacks/${callback.id}" data-method="delete" data-confirm="Are you sure you want to delete this callback?" class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200" title="Delete callback">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </a>
          </div>
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

  getStatusDotClass(status) {
    switch(status) {
      case 'pending':
        return 'bg-yellow-500'
      case 'completed':
        return 'bg-green-500'
      case 'in_progress':
        return 'bg-blue-500'
      case 'cancelled':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  },

  getTimeAgoText(dateString) {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      const futureDays = Math.abs(diffDays)
      return futureDays === 0 ? 'Today' : 
             futureDays === 1 ? 'Tomorrow' : 
             `In ${futureDays} days`
    } else if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else {
      return `${diffDays} days ago`
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
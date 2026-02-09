/**
 * Enhanced Notification System JavaScript
 * 
 * This file handles all notification-related functionality including
 * document status changes, AI reminders, and real-time updates
 */

class EnhancedNotificationSystem {
    constructor() {
        this.notificationContainer = null;
        this.notificationBell = null;
        this.badge = null;
        this.pollingInterval = null;
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.loadNotifications();
        this.startPolling();
    }

    setupElements() {
        this.notificationContainer = document.getElementById('notificationsContainer');
        this.notificationBell = document.querySelector('.notification-bell');
        this.badge = document.querySelector('.notification-badge');
    }

    setupEventListeners() {
        // Notification bell click
        if (this.notificationBell) {
            this.notificationBell.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleNotifications();
            });
        }

        // Close notifications when clicking outside
        document.addEventListener('click', (e) => {
            if (this.notificationContainer && 
                !this.notificationContainer.classList.contains('hidden') && 
                !this.notificationContainer.contains(e.target) && 
                !this.notificationBell.contains(e.target)) {
                this.hideNotifications();
            }
        });

        // Mark all as read
        const markAllRead = document.getElementById('markAllRead');
        if (markAllRead) {
            markAllRead.addEventListener('click', () => {
                this.markAllAsRead();
            });
        }
    }

    toggleNotifications() {
        if (this.notificationContainer) {
            this.notificationContainer.classList.toggle('hidden');
            
            if (!this.notificationContainer.classList.contains('hidden')) {
                this.loadNotifications();
                this.markAsRead();
            }
        }
    }

    hideNotifications() {
        if (this.notificationContainer) {
            this.notificationContainer.classList.add('hidden');
        }
    }

    async loadNotifications() {
        try {
            const response = await fetch('/api/get_notifications.php', {
    credentials: 'include',
    headers: { 'Accept': 'application/json' }
});

            if (data.success && data.notifications) {
                this.displayNotifications(data.notifications);
                this.updateBadge(data.notifications);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    displayNotifications(notifications) {
        const notificationsList = document.getElementById('notificationsList');
        const noNotifications = document.getElementById('noNotifications');

        if (!notificationsList) return;

        if (notifications.length === 0) {
            notificationsList.innerHTML = '';
            if (noNotifications) {
                noNotifications.classList.remove('hidden');
            }
            return;
        }

        if (noNotifications) {
            noNotifications.classList.add('hidden');
        }

        notificationsList.innerHTML = '';

        notifications.forEach(notification => {
            const notificationElement = this.createNotificationElement(notification);
            notificationsList.appendChild(notificationElement);
        });
        
        // Add event listeners for ignore buttons
        this.addIgnoreButtonListeners();
    }

    ✅ Diagnosis Complete
Root Causes (ranked by severity)

Critical SyntaxError at line 3348 → Broken enhanced-notifications.js
Malformed template literals (missing backticks + markdown pasted into JS)
Specifically this block is invalid JS:
JavaScriptactionLink = `

[View Document
](?page=documents&id=${notification.document_id})

`;→ Parser sees actionLink =  (newline) → Invalid left-hand side
TypeError at line 2120 → Element lookup returns null
Code runs document.getElementById('xxx').addEventListener but the element doesn't exist yet or ID is wrong.

401 Unauthorized on /api/get_notifications.php (both inline + enhanced-notifications.js)
fetch() is called without{ credentials: 'include' }
Relative path ../api/ is fragile
Session cookie is not being sent



Fixes (Apply in this order)
1. Fix assets/js/enhanced-notifications.js (Most Important)
Replace the entire createNotificationElement() and getPriorityIcon() with this corrected version:
JavaScriptcreateNotificationElement(notification) {
    const notificationItem = document.createElement('div');
    notificationItem.className = `notification-item ${notification.is_read ? '' : 'unread'} ${notification.priority || 'normal'}`;

    const date = new Date(notification.created_at);
    const formattedDate = this.formatDate ? this.formatDate(date) : date.toLocaleString();

    const priorityIcon = this.getPriorityIcon(notification.priority);
    const statusBadge = this.getStatusBadge ? this.getStatusBadge(notification.status) : '';

    let actionLink = '';
    if (notification.document_id) {
        actionLink = `<a href="?page=documents&id=${notification.document_id}" class="text-blue-600 hover:underline text-sm">View Document →</a>`;
    }

    notificationItem.innerHTML = `
        <div class="flex items-start gap-3 p-3">
            <div class="text-xl">${priorityIcon}</div>
            <div class="flex-1">
                <div class="font-medium">${notification.title || 'Notification'}</div>
                <div class="text-sm text-gray-600 mt-1">${notification.message || ''}</div>
                ${statusBadge}
                ${actionLink}
                <div class="text-xs text-gray-500 mt-2">${formattedDate}</div>
            </div>
            <button class="ignore-btn text-gray-400 hover:text-red-600 text-xs">Ignore</button>
        </div>
    `;
    return notificationItem;
}

getPriorityIcon(priority) {
    const icons = {
        'critical': '🔴',
        'high':    '🟠',
        'normal':  'ℹ️',
        'low':     '🔵'
    };
    return icons[priority?.toLowerCase()] || icons.normal;
}

    getStatusBadge(status) {
        if (!status) return '';

        const badges = {
            'pending': '<span class="inline-block px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800 mt-1">Pending</span>',
            'approved': '<span class="inline-block px-2 py-0.5 rounded text-xs bg-green-100 text-green-800 mt-1">Approved</span>',
            'rejected': '<span class="inline-block px-2 py-0.5 rounded text-xs bg-red-100 text-red-800 mt-1">Rejected</span>',
            'on_hold': '<span class="inline-block px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-800 mt-1">On Hold</span>',
            'revision_requested': '<span class="inline-block px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 mt-1">Revision Requested</span>',
            'urgent': '<span class="inline-block px-2 py-0.5 rounded text-xs bg-red-100 text-red-800 mt-1">Urgent</span>',
            'stuck': '<span class="inline-block px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800 mt-1">Stuck</span>',
            'memorandum': '<span class="inline-block px-2 py-0.5 rounded text-xs bg-indigo-100 text-indigo-800 mt-1">Memorandum</span>',
            'deadline': '<span class="inline-block px-2 py-0.5 rounded text-xs bg-red-100 text-red-800 mt-1">Deadline</span>'
        };

        return badges[status] || '';
    }

    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return date.toLocaleDateString();
    }

    updateBadge(notifications) {
        if (!this.badge) return;

        const unreadCount = notifications.filter(n => !n.is_read).length;
        const criticalCount = notifications.filter(n => !n.is_read && n.priority === 'critical').length;

        if (unreadCount === 0) {
            this.badge.classList.add('hidden');
        } else {
            this.badge.classList.remove('hidden');
            this.badge.textContent = unreadCount;
            
            // Add critical indicator
            if (criticalCount > 0) {
                this.badge.classList.add('bg-red-500', 'animate-pulse');
            } else {
                this.badge.classList.remove('bg-red-500', 'animate-pulse');
            }
        }
    }

    async markAsRead() {
        try {
            await fetch('../api/mark_notifications_read.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    }

    async markAllAsRead() {
        try {
            const response = await fetch('../api/mark_all_notifications_read.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.loadNotifications();
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    startPolling() {
        // Poll for new notifications every 30 seconds
        this.pollingInterval = setInterval(() => {
            this.loadNotifications();
        }, 30000);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    // Document status change methods
    async updateDocumentStatus(documentId, newStatus, reason = '') {
        try {
            const response = await fetch('../api/update_document_status.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    document_id: documentId,
                    status: newStatus,
                    reason: reason
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showSuccessMessage(`Document ${newStatus} successfully`);
                this.loadNotifications(); // Refresh notifications
                return true;
            } else {
                this.showErrorMessage(data.error || 'Failed to update document status');
                return false;
            }
        } catch (error) {
            console.error('Error updating document status:', error);
            this.showErrorMessage('Error updating document status');
            return false;
        }
    }

    async generateAIReminder(documentId, reminderType = 'general') {
        try {
            const response = await fetch('../api/ai_reminder_system.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `action=generate_ai_reminder&document_id=${documentId}&reminder_type=${reminderType}`
            });

            const data = await response.json();

            if (data.success) {
                this.showSuccessMessage('AI reminder generated successfully');
                return data.reminder;
            } else {
                this.showErrorMessage(data.error || 'Failed to generate AI reminder');
                return null;
            }
        } catch (error) {
            console.error('Error generating AI reminder:', error);
            this.showErrorMessage('Error generating AI reminder');
            return null;
        }
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        
        notification.innerHTML = `
            <div class="flex justify-between items-center">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                    ×
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Add event listeners for ignore buttons
    addIgnoreButtonListeners() {
        const ignoreButtons = document.querySelectorAll('.ignore-notification-btn');
        console.log('Enhanced notifications: Found ignore buttons:', ignoreButtons.length);
        
        ignoreButtons.forEach((button, index) => {
            console.log(`Enhanced notifications: Adding listener to button ${index}:`, button);
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const notificationId = button.getAttribute('data-notification-id');
                console.log('Enhanced notifications: Ignore button clicked for notification:', notificationId);
                if (notificationId) {
                    this.ignoreNotification(notificationId, button);
                }
            });
        });
    }
    
    // Ignore notification function
    async ignoreNotification(notificationId, buttonElement) {
        // Show confirmation
        if (!confirm('Are you sure you want to ignore this notification? This action cannot be undone.')) {
            return;
        }
        
        // Disable button to prevent multiple clicks
        buttonElement.disabled = true;
        buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ignoring...';
        
        try {
            const response = await fetch('../api/ignore_notification.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    notification_id: notificationId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Remove the notification item from the UI
                const notificationItem = buttonElement.closest('.notification-item');
                if (notificationItem) {
                    notificationItem.style.opacity = '0.5';
                    notificationItem.style.transition = 'opacity 0.3s ease';
                    
                    setTimeout(() => {
                        notificationItem.remove();
                        
                        // Check if there are any notifications left
                        const remainingNotifications = document.querySelectorAll('.notification-item');
                        if (remainingNotifications.length === 0) {
                            // Show "No notifications" message
                            const noNotifications = document.getElementById('noNotifications');
                            if (noNotifications) {
                                noNotifications.classList.remove('hidden');
                            }
                            this.updateBadge([]);
                        } else {
                            // Update badge count
                            const unreadCount = document.querySelectorAll('.notification-item.unread').length;
                            this.updateBadgeCount(unreadCount);
                        }
                    }, 300);
                }
                
                console.log('Enhanced notifications: Notification ignored successfully');
            } else {
                // Re-enable button and show error
                buttonElement.disabled = false;
                buttonElement.innerHTML = '<i class="fas fa-times"></i> IGNORE';
                alert('Failed to ignore notification: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Enhanced notifications: Error ignoring notification:', error);
            // Re-enable button and show error
            buttonElement.disabled = false;
            buttonElement.innerHTML = '<i class="fas fa-times"></i> IGNORE';
            alert('Failed to ignore notification. Please try again.');
        }
    }
    
    // Update badge count helper
    updateBadgeCount(count) {
        if (this.badge) {
            if (count > 0) {
                this.badge.textContent = count > 99 ? '99+' : count;
                this.badge.classList.remove('hidden');
                this.badge.style.display = 'flex';
            } else {
                this.badge.textContent = '0';
                this.badge.classList.add('hidden');
            }
        }
    }

    // Cleanup method
    destroy() {
        this.stopPolling();
    }
}

// Initialize the enhanced notification system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.enhancedNotifications = new EnhancedNotificationSystem();
});

// Export for use in other scripts
window.EnhancedNotificationSystem = EnhancedNotificationSystem;

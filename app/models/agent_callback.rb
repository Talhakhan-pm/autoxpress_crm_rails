class AgentCallback < ApplicationRecord
  belongs_to :user, foreign_key: 'agent_name', primary_key: 'email', optional: true
  has_many :agent_callback_activities, dependent: :destroy

  # Updated status options for better sales tracking
  STATUS_OPTIONS = [
    'no_answer',
    'pending', 
    'sale',
    'not_interested',
    'follow_up_later',
    'payment_link_sent',
    'already_purchased'
  ].freeze

  validates :status, presence: true, inclusion: { in: STATUS_OPTIONS }
  validates :customer_name, presence: true
  validates :callback_number, presence: true

  before_save :set_last_modified
  before_save :set_last_modified_by
  after_create_commit :broadcast_created
  after_update_commit :broadcast_updated
  after_destroy_commit :broadcast_destroyed

  # Activity tracking methods
  def track_activity(user, activity_type, details = nil, request = nil)
    agent_callback_activities.create!(
      user: user,
      activity_type: activity_type,
      details: details.is_a?(Hash) ? details.to_json : details,
      ip_address: request&.remote_ip,
      user_agent: request&.user_agent,
      occurred_at: Time.current
    )
  end

  def last_viewed_by
    agent_callback_activities.by_type('viewed').recent.first&.user
  end

  def last_viewed_at
    agent_callback_activities.by_type('viewed').recent.first&.occurred_at
  end

  def activity_summary
    AgentCallbackActivity.conversion_funnel(id)
  end

  def recent_activities(limit = 10)
    agent_callback_activities.includes(:user).recent.limit(limit)
  end

  private

  def set_last_modified
    self.last_modified = Time.current
  end

  def set_last_modified_by
    self.last_modified_by = Current.user&.email if defined?(Current.user)
  end

  def broadcast_created
    ActionCable.server.broadcast('realtime_channel', {
      room: 'agent_callbacks',
      action: 'created',
      data: self.as_json
    })
  end

  def broadcast_updated
    ActionCable.server.broadcast('realtime_channel', {
      room: 'agent_callbacks',
      action: 'updated',
      data: self.as_json
    })
  end

  def broadcast_destroyed
    ActionCable.server.broadcast('realtime_channel', {
      room: 'agent_callbacks',
      action: 'destroyed',
      data: { id: id }
    })
  end
end

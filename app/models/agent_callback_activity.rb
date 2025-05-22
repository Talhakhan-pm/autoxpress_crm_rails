class AgentCallbackActivity < ApplicationRecord
  belongs_to :agent_callback
  belongs_to :user

  validates :activity_type, presence: true
  validates :occurred_at, presence: true

  # Activity types for tracking different interactions
  ACTIVITY_TYPES = %w[
    viewed
    created
    updated
    status_changed
    follow_up_scheduled
    follow_up_completed
    comment_added
    exported
    assigned
    unassigned
  ].freeze

  validates :activity_type, inclusion: { in: ACTIVITY_TYPES }

  scope :recent, -> { order(occurred_at: :desc) }
  scope :by_type, ->(type) { where(activity_type: type) }
  scope :for_callback, ->(callback_id) { where(agent_callback_id: callback_id) }
  scope :by_user, ->(user_id) { where(user_id: user_id) }

  # Helper methods for conversion tracking
  def self.conversion_funnel(callback_id)
    activities = for_callback(callback_id).recent
    {
      views: activities.by_type('viewed').count,
      updates: activities.by_type('updated').count,
      status_changes: activities.by_type('status_changed').count,
      follow_ups: activities.by_type('follow_up_scheduled').count + activities.by_type('follow_up_completed').count,
      last_activity: activities.first&.occurred_at
    }
  end

  def self.user_engagement(user_id, timeframe = 7.days)
    where(user: user_id, occurred_at: timeframe.ago..Time.current)
      .group(:activity_type)
      .count
  end

  def formatted_details
    case activity_type
    when 'status_changed'
      details ? JSON.parse(details) : {}
    when 'updated'
      details ? JSON.parse(details) : {}
    else
      details
    end
  rescue JSON::ParserError
    details
  end
end

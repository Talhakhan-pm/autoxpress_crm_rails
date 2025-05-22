class AgentCallback < ApplicationRecord
  belongs_to :user, foreign_key: 'agent_name', primary_key: 'email', optional: true

  validates :status, presence: true
  validates :customer_name, presence: true
  validates :callback_number, presence: true

  before_save :set_last_modified
  before_save :set_last_modified_by
  after_create_commit :broadcast_created
  after_update_commit :broadcast_updated
  after_destroy_commit :broadcast_destroyed

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

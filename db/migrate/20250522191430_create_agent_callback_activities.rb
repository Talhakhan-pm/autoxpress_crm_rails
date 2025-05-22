class CreateAgentCallbackActivities < ActiveRecord::Migration[7.1]
  def change
    create_table :agent_callback_activities do |t|
      t.references :agent_callback, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.string :activity_type
      t.text :details
      t.string :ip_address
      t.string :user_agent
      t.datetime :occurred_at

      t.timestamps
    end
  end
end

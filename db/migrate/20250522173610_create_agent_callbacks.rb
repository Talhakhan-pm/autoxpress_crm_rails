class CreateAgentCallbacks < ActiveRecord::Migration[7.1]
  def change
    create_table :agent_callbacks do |t|
      t.string :status
      t.string :product
      t.string :car_make_model
      t.integer :year
      t.string :zip
      t.string :customer_name
      t.string :callback_number
      t.date :follow_up_date
      t.string :agent_name
      t.text :comments
      t.string :last_modified_by
      t.datetime :last_modified

      t.timestamps
    end
  end
end

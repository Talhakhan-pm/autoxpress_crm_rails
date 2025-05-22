# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_05_22_173610) do
  create_table "agent_callbacks", force: :cascade do |t|
    t.string "status"
    t.string "product"
    t.string "car_make_model"
    t.integer "year"
    t.string "zip"
    t.string "customer_name"
    t.string "callback_number"
    t.date "follow_up_date"
    t.string "agent_name"
    t.text "comments"
    t.string "last_modified_by"
    t.datetime "last_modified"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "callbacks", force: :cascade do |t|
    t.datetime "callback_date", null: false
    t.string "status", null: false
    t.string "product"
    t.string "car_make"
    t.string "car_model"
    t.integer "car_year"
    t.string "zip"
    t.string "customer_name", null: false
    t.string "callback_number", null: false
    t.datetime "follow_up_date"
    t.integer "user_id", null: false
    t.text "comments"
    t.datetime "last_modified"
    t.integer "last_modified_by_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["last_modified_by_id"], name: "index_callbacks_on_last_modified_by_id"
    t.index ["user_id"], name: "index_callbacks_on_user_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.text "message"
    t.boolean "read"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "callbacks", "users"
  add_foreign_key "callbacks", "users", column: "last_modified_by_id"
end

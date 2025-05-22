require "test_helper"

class AgentCallbacksControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get agent_callbacks_index_url
    assert_response :success
  end

  test "should get show" do
    get agent_callbacks_show_url
    assert_response :success
  end

  test "should get new" do
    get agent_callbacks_new_url
    assert_response :success
  end

  test "should get create" do
    get agent_callbacks_create_url
    assert_response :success
  end

  test "should get edit" do
    get agent_callbacks_edit_url
    assert_response :success
  end

  test "should get update" do
    get agent_callbacks_update_url
    assert_response :success
  end

  test "should get destroy" do
    get agent_callbacks_destroy_url
    assert_response :success
  end
end

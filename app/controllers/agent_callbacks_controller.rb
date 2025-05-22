class AgentCallbacksController < ApplicationController
  before_action :authenticate_user!
  before_action :set_agent_callback, only: [:show, :edit, :update, :destroy]

  def index
    @agent_callbacks = AgentCallback.all.order(created_at: :desc)
    
    # Analytics for conversion tracking
    @analytics = {
      total_callbacks: AgentCallback.count,
      status_breakdown: AgentCallback.group(:status).count,
      recent_activity: AgentCallbackActivity.where(occurred_at: 24.hours.ago..Time.current)
                                          .group(:activity_type).count,
      top_agents: AgentCallbackActivity.joins(:user)
                                      .where(occurred_at: 7.days.ago..Time.current)
                                      .group('users.email')
                                      .count
                                      .sort_by { |_, count| -count }
                                      .first(5),
      conversion_metrics: {
        total_created: AgentCallback.where(created_at: 30.days.ago..Time.current).count,
        sales: AgentCallback.where(status: 'sale').count,
        pending: AgentCallback.where(status: 'pending').count,
        no_answer: AgentCallback.where(status: 'no_answer').count,
        not_interested: AgentCallback.where(status: ['not_interested', 'already_purchased']).count,
        follow_up_later: AgentCallback.where(status: 'follow_up_later').count,
        payment_link_sent: AgentCallback.where(status: 'payment_link_sent').count,
        avg_views_per_callback: AgentCallbackActivity.where(activity_type: 'viewed')
                                                   .group(:agent_callback_id)
                                                   .count
                                                   .values
                                                   .sum.to_f / [AgentCallback.count, 1].max
      }
    }
    
    @analytics[:conversion_metrics][:conversion_rate] = 
      (@analytics[:conversion_metrics][:sales].to_f / 
       [@analytics[:conversion_metrics][:total_created], 1].max * 100).round(1)
  end

  def show
    # Track view activity
    @agent_callback.track_activity(current_user, 'viewed', nil, request)
    
    # Load activity timeline for display
    @recent_activities = @agent_callback.recent_activities(20)
    @activity_summary = @agent_callback.activity_summary
  end

  def new
    @agent_callback = AgentCallback.new
  end

  def create
    @agent_callback = AgentCallback.new(agent_callback_params)
    @agent_callback.agent_name = current_user.email

    if @agent_callback.save
      # Track creation activity
      @agent_callback.track_activity(current_user, 'created', {
        customer: @agent_callback.customer_name,
        product: @agent_callback.product,
        status: @agent_callback.status
      }, request)
      
      redirect_to agent_callbacks_path, notice: 'Agent callback was successfully created.'
    else
      render :new
    end
  end

  def edit
  end

  def update
    # Capture changes before update
    original_status = @agent_callback.status
    
    if @agent_callback.update(agent_callback_params)
      # Track update activity
      changes = @agent_callback.previous_changes.except('updated_at', 'last_modified', 'last_modified_by')
      
      @agent_callback.track_activity(current_user, 'updated', {
        changes: changes,
        customer: @agent_callback.customer_name
      }, request)
      
      # Track status change separately if status changed
      if changes.key?('status')
        @agent_callback.track_activity(current_user, 'status_changed', {
          from: original_status,
          to: @agent_callback.status,
          customer: @agent_callback.customer_name
        }, request)
      end
      
      # Track follow-up scheduling if follow_up_date changed
      if changes.key?('follow_up_date') && @agent_callback.follow_up_date.present?
        @agent_callback.track_activity(current_user, 'follow_up_scheduled', {
          date: @agent_callback.follow_up_date,
          customer: @agent_callback.customer_name
        }, request)
      end
      
      redirect_to agent_callbacks_path, notice: 'Agent callback was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @agent_callback.destroy
    redirect_to agent_callbacks_url, notice: 'Agent callback was successfully deleted.'
  end

  private

  def set_agent_callback
    @agent_callback = AgentCallback.find(params[:id])
  end

  def agent_callback_params
    params.require(:agent_callback).permit(:status, :product, :car_make_model, :year, :zip, 
                                           :customer_name, :callback_number, :follow_up_date, :comments)
  end
end

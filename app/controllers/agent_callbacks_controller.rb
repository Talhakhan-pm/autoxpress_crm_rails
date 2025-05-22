class AgentCallbacksController < ApplicationController
  before_action :authenticate_user!
  before_action :set_agent_callback, only: [:show, :edit, :update, :destroy]

  def index
    @agent_callbacks = AgentCallback.all.order(created_at: :desc)
  end

  def show
  end

  def new
    @agent_callback = AgentCallback.new
  end

  def create
    @agent_callback = AgentCallback.new(agent_callback_params)
    @agent_callback.agent_name = current_user.email

    if @agent_callback.save
      redirect_to @agent_callback, notice: 'Agent callback was successfully created.'
    else
      render :new
    end
  end

  def edit
  end

  def update
    if @agent_callback.update(agent_callback_params)
      redirect_to @agent_callback, notice: 'Agent callback was successfully updated.'
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

module Api
  module V1
    class UsersController < ApplicationController
      def create
        user = User.new(user_params)
        if user.save
          reset_session
          session[:user_id] = user.id # 登録成功時にそのままセッションに保存
          render json: { status: :created, user: { id: user.id, name: user.name, email: user.email } }
        else
          render json: { status: :unprocessable_entity, errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def user_params
        params.require(:user).permit(:name, :email, :password, :password_confirmation)
      end
    end
  end
end

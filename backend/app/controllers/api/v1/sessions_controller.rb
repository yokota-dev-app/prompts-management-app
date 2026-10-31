module Api
  module V1
    class SessionsController < ApplicationController
      # ログイン
      def create
        user = User.find_by(email: params[:email])
        if user && user.authenticate(params[:password])
          reset_session
          session[:user_id] = user.id # セッションにユーザーIDを保存
          render json: { status: :ok, message: "Logged in successfully", user: { id: user.id, name: user.name, email: user.email } }
        else
          render json: { status: :unauthorized, message: "Invalid email or password" }, status: :unauthorized
        end
      end

      # ログアウト
      def destroy
        reset_session
        render json: { status: :ok, message: "Logged out successfully" }
      end

      # 現在ログインしているユーザーの確認
      def show
        if session[:user_id] && (user = User.find_by(id: session[:user_id]))
          render json: { logged_in: true, user: { id: user.id, name: user.name, email: user.email } }
        else
          render json: { logged_in: false }
        end
      end
    end
  end
end

module Api
  module V1
    class PromptsController < ApplicationController
      before_action :require_login

      # 自分のプロンプト一覧（最新バージョンの内容を含む）
      def index
        prompts = current_user.prompts.includes(:prompt_versions).order(updated_at: :desc)
        render json: prompts.map { |prompt| prompt_json(prompt) }
      end

      # 自分のプロンプトの詳細
      def show
        prompt = current_user.prompts.includes(:prompt_versions).find_by(id: params[:id])
        return render json: { errors: [ "プロンプトが見つかりません" ] }, status: :not_found unless prompt

        render json: prompt_json(prompt)
      end

      # プロンプト作成（初版のバージョンも同時に保存）
      def create
        prompt = current_user.prompts.new(prompt_attributes)
        prompt.build_first_version(content: prompt_params[:content], variable_settings: variable_settings)

        if prompt.save
          render json: { id: prompt.id }, status: :created
        else
          render json: { errors: prompt.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # プロンプト更新（内容や変数が変わった場合は新しいバージョンを追加）
      def update
        prompt = current_user.prompts.includes(:prompt_versions).find_by(id: params[:id])
        return render json: { errors: [ "プロンプトが見つかりません" ] }, status: :not_found unless prompt

        prompt.assign_attributes(prompt_attributes)
        prompt.add_version_if_changed(content: prompt_params[:content], variable_settings: variable_settings)
        prompt.updated_at = Time.current

        if prompt.save
          render json: { id: prompt.id }
        else
          render json: { errors: prompt.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # プロンプト削除（バージョンも一緒に削除）
      def destroy
        prompt = current_user.prompts.find_by(id: params[:id])
        return render json: { errors: [ "プロンプトが見つかりません" ] }, status: :not_found unless prompt

        prompt.destroy!
        head :no_content
      end

      private

      def prompt_json(prompt)
        latest = prompt.latest_version
        {
          id: prompt.id,
          title: prompt.title,
          description: prompt.description,
          content: latest&.content.to_s,
          is_public: prompt.is_public,
          variable_settings: latest&.variable_settings || {},
          author: current_user.name,
          updated_at: prompt.updated_at
        }
      end

      def prompt_attributes
        prompt_params.slice(:title, :description, :is_public)
      end

      def variable_settings
        prompt_params[:variable_settings]&.to_h || {}
      end

      def prompt_params
        params.require(:prompt).permit(:title, :description, :is_public, :content, variable_settings: {})
      end

      def current_user
        @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
      end

      def require_login
        render json: { errors: [ "ログインが必要です" ] }, status: :unauthorized unless current_user
      end
    end
  end
end

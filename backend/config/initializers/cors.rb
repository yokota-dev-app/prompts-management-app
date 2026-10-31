Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # 追加のオリジンはカンマ区切りの環境変数 CORS_ALLOWED_ORIGINS で指定できる
    extra_origins = ENV.fetch("CORS_ALLOWED_ORIGINS", "").split(",").map(&:strip).reject(&:empty?)

    origins "http://localhost:5173",
            "https://prompts-management-app.vercel.app",
            # Vercelのプレビュー環境 (例: prompts-management-app-git-<branch>-<team>.vercel.app)
            %r{\Ahttps://prompts-management-app(-[a-z0-9-]+)?\.vercel\.app\z},
            *extra_origins

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
      credentials: true
  end
end

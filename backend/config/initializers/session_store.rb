Rails.application.config.session_store :cookie_store,
  key: "promps_management_app",
  same_site: Rails.env.production? ? :none : :lax,
  secure: Rails.env.production?

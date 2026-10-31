class Prompt < ApplicationRecord
  belongs_to :user
  has_many :prompt_versions, dependent: :destroy

  validates :title, presence: true

  # includes済みの関連をメモリ上で参照し、追加クエリを発行しない
  def latest_version
    prompt_versions.max_by(&:version_number)
  end

  def build_first_version(content:, variable_settings: {})
    prompt_versions.build(version_number: 1, content: content, variable_settings: variable_settings)
  end

  # 内容か変数が変わっていれば新バージョンを積む。積んだ場合はtrueを返す
  def add_version_if_changed(content:, variable_settings: {})
    latest = latest_version
    return false if latest && latest.content == content && latest.variable_settings == variable_settings

    prompt_versions.build(
      version_number: (latest&.version_number || 0) + 1,
      content: content,
      variable_settings: variable_settings
    )
    true
  end
end

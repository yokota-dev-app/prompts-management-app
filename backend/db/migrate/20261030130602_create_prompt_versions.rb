class CreatePromptVersions < ActiveRecord::Migration[8.1]
  def change
    create_table :prompt_versions do |t|
      t.integer :version_number, null: false
      t.text :content, null: false
      t.jsonb :variable_settings, null: false, default: {}
      t.references :prompt, foreign_key: true, null: false

      t.timestamps

      t.index [ :prompt_id, :version_number ], unique: true
    end
  end
end

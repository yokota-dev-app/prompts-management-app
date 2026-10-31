require "rails_helper"

RSpec.describe Prompt, type: :model do
  describe "validations" do
    it "is valid with the factory" do
      expect(build(:prompt)).to be_valid
    end

    it "requires a title" do
      prompt = build(:prompt, title: nil)

      expect(prompt).not_to be_valid
      expect(prompt.errors.of_kind?(:title, :blank)).to be(true)
    end
  end

  describe "#latest_version" do
    it "returns the version with the highest version_number" do
      prompt = create(:prompt, content: "v1")
      prompt.prompt_versions.create!(version_number: 3, content: "v3")
      prompt.prompt_versions.create!(version_number: 2, content: "v2")

      expect(prompt.reload.latest_version.content).to eq("v3")
    end

    it "returns nil without versions" do
      expect(Prompt.new.latest_version).to be_nil
    end
  end

  describe "#build_first_version" do
    it "builds version 1 with the given attributes" do
      prompt = build(:prompt, content: "ignored")
      prompt.prompt_versions.clear
      version = prompt.build_first_version(content: "hello", variable_settings: { "name" => "Taro" })

      expect(version).to have_attributes(version_number: 1, content: "hello", variable_settings: { "name" => "Taro" })
    end
  end

  describe "#add_version_if_changed" do
    let(:prompt) { Prompt.includes(:prompt_versions).find(create(:prompt, content: "v1").id) }

    it "does nothing when content and variables are unchanged" do
      expect(prompt.add_version_if_changed(content: "v1", variable_settings: {})).to be(false)
      expect { prompt.save! }.not_to change(PromptVersion, :count)
    end

    it "adds the next version when content changes" do
      expect(prompt.add_version_if_changed(content: "v2", variable_settings: {})).to be(true)
      expect { prompt.save! }.to change(PromptVersion, :count).by(1)
      expect(prompt.reload.latest_version).to have_attributes(version_number: 2, content: "v2")
    end

    it "adds the next version when only variables change" do
      expect(prompt.add_version_if_changed(content: "v1", variable_settings: { "a" => "b" })).to be(true)
      prompt.save!
      expect(prompt.reload.latest_version).to have_attributes(version_number: 2, variable_settings: { "a" => "b" })
    end
  end
end

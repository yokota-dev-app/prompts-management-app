require "rails_helper"

RSpec.describe "Api::V1 prompts", type: :request do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }

  context "when not logged in" do
    it "rejects index" do
      get "/api/v1/prompts"
      expect(response).to have_http_status(:unauthorized)
    end

    it "rejects create" do
      post "/api/v1/prompts", params: { prompt: { title: "t", content: "c" } }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  context "when logged in" do
    before { sign_in(user) }

    describe "GET /api/v1/prompts" do
      it "returns only the current user's prompts with latest content" do
        mine = create(:prompt, user: user, content: "my content")
        create(:prompt, user: other_user)

        get "/api/v1/prompts"

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body.map { |p| p["id"] }).to eq([ mine.id ])
        expect(response.parsed_body.first).to include("title" => mine.title, "content" => "my content", "author" => user.name)
      end

      it "does not trigger N+1 queries with multiple prompts" do
        create_list(:prompt, 3, user: user)

        get "/api/v1/prompts"

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body.size).to eq(3)
      end
    end

    describe "GET /api/v1/prompts/:id" do
      it "returns the prompt" do
        prompt = create(:prompt, user: user, content: "hello")

        get "/api/v1/prompts/#{prompt.id}"

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to include("id" => prompt.id, "content" => "hello", "is_public" => true)
      end

      it "returns 404 for another user's prompt" do
        prompt = create(:prompt, user: other_user)

        get "/api/v1/prompts/#{prompt.id}"

        expect(response).to have_http_status(:not_found)
      end
    end

    describe "POST /api/v1/prompts" do
      let(:params) do
        { prompt: { title: "New", description: "desc", is_public: false, content: "Hi {{name}}", variable_settings: { name: "Taro" } } }
      end

      it "creates a prompt with its first version" do
        expect { post "/api/v1/prompts", params: params, as: :json }
          .to change(Prompt, :count).by(1).and change(PromptVersion, :count).by(1)

        expect(response).to have_http_status(:created)
        prompt = Prompt.find(response.parsed_body["id"])
        expect(prompt).to have_attributes(user_id: user.id, title: "New", is_public: false)
        expect(prompt.prompt_versions.first).to have_attributes(version_number: 1, content: "Hi {{name}}", variable_settings: { "name" => "Taro" })
      end

      it "returns errors without a title" do
        params[:prompt][:title] = ""

        expect { post "/api/v1/prompts", params: params, as: :json }.not_to change(Prompt, :count)
        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"]).not_to be_empty
      end

      it "returns errors without content" do
        params[:prompt][:content] = ""

        expect { post "/api/v1/prompts", params: params, as: :json }.not_to change(Prompt, :count)
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    describe "PATCH /api/v1/prompts/:id" do
      let!(:prompt) { create(:prompt, user: user, content: "v1 content") }

      it "adds a new version when content changes" do
        expect {
          patch "/api/v1/prompts/#{prompt.id}", params: { prompt: { title: "Updated", content: "v2 content" } }, as: :json
        }.to change { prompt.prompt_versions.count }.from(1).to(2)

        expect(response).to have_http_status(:ok)
        expect(prompt.reload.title).to eq("Updated")
        expect(prompt.prompt_versions.order(:version_number).last.content).to eq("v2 content")
      end

      it "does not add a version when content and variables are unchanged" do
        expect {
          patch "/api/v1/prompts/#{prompt.id}", params: { prompt: { title: "Only title", content: "v1 content" } }, as: :json
        }.not_to change(PromptVersion, :count)

        expect(prompt.reload.title).to eq("Only title")
      end

      it "returns errors for an invalid title" do
        patch "/api/v1/prompts/#{prompt.id}", params: { prompt: { title: "", content: "v1 content" } }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(prompt.reload.title).not_to be_blank
      end

      it "returns 404 for another user's prompt" do
        other = create(:prompt, user: other_user)

        patch "/api/v1/prompts/#{other.id}", params: { prompt: { title: "Hacked", content: "x" } }, as: :json

        expect(response).to have_http_status(:not_found)
        expect(other.reload.title).not_to eq("Hacked")
      end
    end

    describe "DELETE /api/v1/prompts/:id" do
      it "deletes the prompt and its versions" do
        prompt = create(:prompt, user: user)

        expect { delete "/api/v1/prompts/#{prompt.id}" }
          .to change(Prompt, :count).by(-1).and change(PromptVersion, :count).by(-1)
        expect(response).to have_http_status(:no_content)
      end

      it "returns 404 for another user's prompt" do
        other = create(:prompt, user: other_user)

        expect { delete "/api/v1/prompts/#{other.id}" }.not_to change(Prompt, :count)
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end

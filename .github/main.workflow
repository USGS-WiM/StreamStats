workflow "Deploy to Test" {
  on = "push"
  resolves = ["GitHub Action for Slack"]
}

action "Filters for GitHub Actions" {
  uses = "actions/bin/filter@3c0b4f0e63ea54ea5df2914b4fabf383368cd0da"
  args = "branch staging"
}

action "GitHub Action for AWS" {
  uses = "actions/aws/cli@efb074ae4510f2d12c7801e4461b65bf5e8317e6"
  needs = ["Filters for GitHub Actions"]
  args = "s3 cp $GITHUB_WORKSPACE/dist/ s3://test.streamstats.usgs.gov/ss/  --recursive"
  secrets = ["AWS_SECRET_ACCESS_KEY", "AWS_ACCESS_KEY_ID"]
}

action "GitHub Action for Slack" {
  uses = "Ilshidur/action-slack@6aeb2acb39f91da283faf4c76898a723a03b2264"
  needs = ["GitHub Action for AWS"]
  args = " Successfully deployed to  https://test.streamstats.usgs.gov/ss"
  secrets = ["SLACK_WEBHOOK"]
}

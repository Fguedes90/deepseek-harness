# AGENTS.md — GitHub Actions

Every job runs on a standard GitHub-hosted runner; this repository owns no enterprise pool, self-hosted pool, or failover variable, so a workflow must never name one. Run Windows jobs on `windows-*` labels under native `pwsh`. The pull-request `windows` job is the deliberate exception: it runs Windows Node under Wine on hosted Linux and blocks `all checks passed`, while `windows-native` runs the complete native inventory on `windows-latest` and also blocks it. Push-triggered lanes key on `main`.

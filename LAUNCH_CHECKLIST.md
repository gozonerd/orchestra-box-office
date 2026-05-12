# Orchestra Box Office — Launch Checklist

**Launch Date:** 2026-04-20  
**Status:** In Progress (Stage 15)

## Pre-Launch Security

- [ ] **Code Security**
  - [ ] gitleaks scan shows zero secrets
  - [ ] cargo audit shows zero high/critical
  - [ ] npm audit shows zero moderate+ issues (production only)
  - [ ] Semgrep SAST clean (zero high/critical)
  - [ ] No hardcoded URLs, keys, or credentials

- [ ] **Secrets Management**
  - [ ] API keys stored in Fly.io secrets (not in code)
  - [ ] Database credentials in env vars only
  - [ ] Auth tokens use 7-day expiry + rotation
  - [ ] Session cookies secure, httponly, sameSite=Strict

- [ ] **Data Privacy**
  - [ ] GDPR compliance: right to deletion implemented
  - [ ] Data retention policy: audit logs 2 years, sync queue 90 days
  - [ ] Encryption at rest (SQLCipher desktop, PostgreSQL cloud)
  - [ ] Encryption in transit (TLS 1.3 enforced)
  - [ ] Privacy policy reviewed by legal

- [ ] **Access Control**
  - [ ] Row-level security (RLS) in PostgreSQL
  - [ ] All API endpoints verify user ownership
  - [ ] No cross-user data leakage
  - [ ] Admin endpoints blocked in production

## Pre-Launch Testing

- [ ] **Unit Tests**
  - [ ] 100% of critical paths covered
  - [ ] All tests pass: `npm run test`
  - [ ] Code coverage report generated
  - [ ] Desktop: 80%+ coverage
  - [ ] API: 85%+ coverage

- [ ] **Integration Tests**
  - [ ] Desktop ↔ API communication verified
  - [ ] Sync queue → entities flow tested
  - [ ] Conflict resolution paths tested
  - [ ] Error scenarios tested

- [ ] **E2E Tests**
  - [ ] All 13+ Playwright tests pass
  - [ ] Authentication flow tested
  - [ ] Budget CRUD operations verified
  - [ ] Cloud sync roundtrip successful
  - [ ] Tests run on all platforms

- [ ] **Performance Testing**
  - [ ] Desktop startup < 3 seconds
  - [ ] Dashboard load < 1 second
  - [ ] Batch sync (100 entries) < 2 seconds
  - [ ] API response time p95 < 500ms
  - [ ] Database query p95 < 100ms

- [ ] **Security Testing**
  - [ ] OWASP ZAP DAST scan complete
  - [ ] No high/critical vulnerabilities
  - [ ] SQL injection tests pass
  - [ ] XSS protection verified
  - [ ] CSRF tokens validated

## Pre-Launch Infrastructure

- [ ] **Cloud API (Fly.io)**
  - [ ] PostgreSQL database configured (Neon)
  - [ ] Automatic daily backups enabled
  - [ ] Point-in-time recovery tested
  - [ ] Health checks configured
  - [ ] Auto-scaling policies set
  - [ ] TLS certificates auto-renewed
  - [ ] All required environment variables set

- [ ] **Desktop Distribution**
  - [ ] Code signing certificates installed
  - [ ] All binaries signed (Windows, macOS, Linux)
  - [ ] Update manifest (`update.json`) generated
  - [ ] Auto-update mechanism tested
  - [ ] Rollback procedure verified

- [ ] **Monitoring & Logging**
  - [ ] Error tracking configured (optional: Sentry)
  - [ ] Log aggregation set up (Fly.io logs)
  - [ ] Performance monitoring enabled
  - [ ] Alerts configured for errors/downtime
  - [ ] On-call rotation established

- [ ] **DNS & CDN**
  - [ ] api.orchestraboxoffice.com → Fly.io
  - [ ] www.orchestraboxoffice.com → documentation
  - [ ] DNS propagation verified (24h wait)
  - [ ] CDN caching policies configured

## Pre-Launch Documentation

- [ ] **User Documentation**
  - [ ] Installation guide (Windows, macOS, Linux)
  - [ ] Getting started tutorial
  - [ ] Budget tracking walkthrough
  - [ ] Cloud sync explanation
  - [ ] FAQ and troubleshooting
  - [ ] Privacy policy and ToS

- [ ] **Developer Documentation**
  - [ ] API documentation (OpenAPI/Swagger)
  - [ ] Database schema documented
  - [ ] Deployment guide complete
  - [ ] Contributing guidelines
  - [ ] Architecture decision records

- [ ] **Internal Documentation**
  - [ ] Runbook for incidents
  - [ ] Deployment procedures
  - [ ] Database maintenance guide
  - [ ] Monitoring dashboard link
  - [ ] Emergency contacts

## Pre-Launch Communications

- [ ] **Marketing**
  - [ ] Landing page live
  - [ ] Social media announcement scheduled
  - [ ] Press release prepared
  - [ ] Beta tester thank-yous sent
  - [ ] Launch day content ready

- [ ] **Support**
  - [ ] Support email monitored (support@orchestraboxoffice.com)
  - [ ] Issue tracking system ready
  - [ ] FAQ knowledge base created
  - [ ] Community channel established (Discord/Slack)
  - [ ] SLA for critical issues set

- [ ] **Beta Feedback**
  - [ ] All critical beta issues resolved
  - [ ] Beta tester feedback incorporated
  - [ ] Known limitations documented
  - [ ] Future roadmap published

## Launch Day (2026-04-20)

- [ ] **6 hours before**
  - [ ] Final health checks: desktop, API, database
  - [ ] Team notification sent
  - [ ] Monitoring dashboards open
  - [ ] On-call team standby

- [ ] **2 hours before**
  - [ ] Create desktop v1.0.0 release tag
  - [ ] Verify all CI checks pass
  - [ ] Smoke test all platforms

- [ ] **At launch**
  - [ ] Push v1.0.0 tag to GitHub
  - [ ] Announce on social media
  - [ ] Send email to beta testers
  - [ ] Monitor error rates and performance
  - [ ] Check desktop auto-update delivery

- [ ] **4 hours after launch**
  - [ ] Verify 100+ installations (GitHub Releases downloads)
  - [ ] Check support email for issues
  - [ ] Monitor crash reports
  - [ ] Verify sync data flowing to cloud

- [ ] **24 hours after launch**
  - [ ] Review feedback and issues
  - [ ] Prepare hotfix if needed
  - [ ] Publish launch recap blog post
  - [ ] Send thank-you message to community

## Post-Launch (Week 1)

- [ ] **Monitoring**
  - [ ] Daily monitoring for critical issues
  - [ ] Response to user support tickets (<2h)
  - [ ] Track user adoption (installations, DAU)
  - [ ] Monitor API performance and error rates
  - [ ] Database performance steady

- [ ] **Quality**
  - [ ] Triage reported bugs
  - [ ] Create fixes for high-priority issues
  - [ ] Plan v1.0.1 hotfix if needed
  - [ ] Gather usage data for feature priorities

- [ ] **Communication**
  - [ ] Daily status updates to stakeholders
  - [ ] Publish launch day metrics
  - [ ] Respond to all public feedback
  - [ ] Update documentation based on feedback

## Success Criteria

| Metric | Target | Definition |
|--------|--------|------------|
| Uptime | 99.5% | No more than 3.6 hours downtime per month |
| Error Rate | <0.5% | API 5xx errors per total requests |
| P95 Latency | <500ms | API response time (no auth requests) |
| Startup Time | <3s | Desktop app launch to dashboard visible |
| User Adoption | 100+ | Downloads in first week |
| Support SLA | <2h | Response time for user issues |
| Zero Critical Issues | Day 7 | No unresolved security/data-loss issues |

## Risk Mitigation

### Risk: High user volume causes API overload
- **Mitigation:** Auto-scaling on Fly.io, connection pooling, query optimization
- **Response:** Rate limiting, gradual rollout to more users

### Risk: Data corruption in sync
- **Mitigation:** Comprehensive testing, backup verification, transaction isolation
- **Response:** Rollback to v0.9.9, manual data recovery

### Risk: Desktop app crashes on startup
- **Mitigation:** Crash reporting, extensive testing on all platforms
- **Response:** Immediate v1.0.1 hotfix, fallback to v0.9.9

### Risk: Security vulnerability discovered
- **Mitigation:** Security testing pre-launch, dependency scanning
- **Response:** Emergency hotfix within 24h, security advisory published

## Sign-Off

- [ ] **Engineering Lead** — Code quality, testing, deployment readiness
- [ ] **Product Manager** — Feature completeness, user experience
- [ ] **Security Officer** — Security testing, vulnerability assessment
- [ ] **Operations Lead** — Infrastructure readiness, monitoring, incident response
- [ ] **CEO/Founder** — Business readiness, go/no-go decision

---

## Tracking

**Last Updated:** 2026-04-14  
**Next Review:** 2026-04-18  
**Launch Status:** On Track

For questions: team@orchestraboxoffice.com

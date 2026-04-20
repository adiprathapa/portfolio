<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of your portfolio site with PostHog analytics. The `posthog-js` and `@posthog/react` packages were installed, PostHog was initialized in `src/main.tsx` via `PostHogProvider`, and 12 custom events were added across 5 components tracking key user interactions — from hero engagement through project exploration to contact conversions.

| Event | Description | File |
|---|---|---|
| `contact_form_submitted` | User successfully submits the contact form with their email | `src/components/Contact.tsx` |
| `contact_form_error` | Contact form submission fails (network/server error) | `src/components/Contact.tsx` |
| `social_link_clicked` | User clicks a social link (GitHub, LinkedIn, Email) in the Contact section | `src/components/Contact.tsx` |
| `lets_talk_clicked` | User clicks the primary "Let's talk" CTA in the navbar | `src/components/Navbar.tsx` |
| `nav_link_clicked` | User clicks a nav link (About, Projects, Experience, Contact) | `src/components/Navbar.tsx` |
| `resume_viewed` | User clicks the Resume link in the navbar | `src/components/Navbar.tsx` |
| `linkedin_profile_clicked` | User clicks the LinkedIn profile on the hero coin (front face) | `src/components/Hero.tsx` |
| `github_profile_clicked` | User clicks the GitHub profile on the hero coin (back face) | `src/components/Hero.tsx` |
| `hero_language_tooltip_viewed` | User hovers the greeting to trigger the language breakdown tooltip | `src/components/Hero.tsx` |
| `project_video_viewed` | User clicks "View Video" on a project card | `src/components/ui/flip-safari.tsx` |
| `project_repo_opened` | User clicks "Repository" on a project card | `src/components/ui/flip-safari.tsx` |
| `footer_social_link_clicked` | User clicks a social or resource link in the footer | `src/components/Footer.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics:** https://us.posthog.com/project/390119/dashboard/1489468
- **Contact form submissions (trend):** https://us.posthog.com/project/390119/insights/kVjbRcNX
- **Contact funnel: Tooltip → Let's Talk → Form Submitted:** https://us.posthog.com/project/390119/insights/ZAf0hHZI
- **Project engagement by project:** https://us.posthog.com/project/390119/insights/eDRTGXuq
- **Social link clicks by platform:** https://us.posthog.com/project/390119/insights/tC0IVxoG
- **Navigation & CTA engagement:** https://us.posthog.com/project/390119/insights/NDdazitv

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>

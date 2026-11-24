# UI/UX specification

## Approved palette and typography

The palette was approved on 2026-11-24. The profile screen uses Fraunces at weight 600 for its display heading, with the existing sans-serif body font.

| Token | Value | Use |
|---|---|---|
| Ink | `#28142B` | Primary text |
| Plum | `#4A2148` | Primary actions, selected pills and links |
| Ivory | `#FBF6F0` | Page background |
| Muted | `#6F5D6E` | Supporting text; this value or darker only |
| Line | `#D9C9D6` | Borders and dividers |
| Error | `#B42318` | Error text and destructive actions |
| Success | `#146C43` | Success text |
| Rose | `#C4476F` | Large text or buttons with white text; never small text on ivory |
| Gold | `#B8893A` | Decorative accents only; never text or a background behind white text |

Use only one primary button per screen state. Secondary actions are outlined. Status dots are decorative and their adjacent text carries the meaning. Errors and success messages appear as inline text with an icon and no enclosing box.

## Profile screen

The profile page has a narrow top bar with an accessible back arrow and centered “Your profile” title. It omits the Eluda wordmark. The identity heading shows display name and computed age in Fraunces; intent appears in a plum pill. The visibility card appears before availability, photos and About you.

Women see an Availability card with three native radio inputs styled as a segmented control. Keep each segment at least 44 px tall and preserve native arrow-key radio navigation. Men do not see this control. The helper explains the effect of Hidden availability.

### Photo grid and options sheet

Use three equal columns with an 8 px gap. The main photo occupies two columns and two rows, has a Main chip and retains an accessible 44 px options target. Other photos use one grid cell. Show one dashed Add photo tile while fewer than six photos exist; hide it at six. During upload the add tile displays an indeterminate spinner and “Uploading…” and is disabled. Respect reduced-motion preferences. Place the existing upload failure copy directly under the grid with an alert icon and `role="alert"`.

Each photo has a 44 px touch target containing a 36 px translucent dark circle with a white ellipsis and the accessible name “Photo options”. The native dialog opens as a bottom sheet with a scrim, closes with Escape or a scrim tap, receives focus when opened, and returns focus to the triggering options button when closed. Its rows are Make main (hidden for the main photo), Delete photo and Cancel. Deletion opens a confirmation sheet with the exact confirmation copy. When deleting would violate the published two-photo minimum, disable the destructive action and explain that another photo must be added.

### Disabled actions and profile errors

When fewer than two photos exist, disable Publish profile and show the exact number of photos still needed. Keep the server-side rule authoritative. Once there are at least two photos, Publish profile is the single filled primary action. A published profile has an outlined Unpublish profile action and no filled primary action.

About you includes display name and four intent pills. Availability and profile edits share one outlined Save changes button, disabled until a value changes and while saving. Attempt the relevant existing actions and show their field errors inline. Show “Saved.” in green only when all requested changes succeed. Preserve existing server error messages.

## Logo

The logo mark and removal of the Eluda wordmark from auth pages are reserved for the separate logo task.

import type { EducationId } from '../data/education'

export const OPEN_EDUCATION_EVENT = 'open-education'

export function openEducation(id: EducationId) {
  window.dispatchEvent(new CustomEvent<EducationId>(OPEN_EDUCATION_EVENT, { detail: id }))
}

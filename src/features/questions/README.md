# Question Builder Feature

The Question Builder is a comprehensive feature for creating and managing assignment questions in the BaiTapVui platform. It supports multiple question types, media attachments, and provides a rich editing experience for teachers.

## Features

### Implemented Tasks

- **KAN-75**: Build Question Builder Base Layout
- **KAN-76**: Implement Question CRUD (Add / Edit / Delete)
- **KAN-77**: Implement Question Reordering
- **KAN-78**: Implement Answer Type Selection (MC / Essay)
- **KAN-79**: Implement Multiple Choice Options UI
- **KAN-80**: Implement Media Attachment for Questions
- **KAN-81**: Persist Question Builder State

## Architecture

### Directory Structure

```
src/features/questions/
├── components/
│   ├── QuestionBuilder.tsx          # Main container component
│   ├── QuestionEditor.tsx            # Question editor component
│   ├── QuestionList.tsx              # Question navigation sidebar
│   ├── QuestionTypeToggle.tsx        # Type selection toggle
│   ├── MultipleChoiceOptions.tsx     # MC options manager
│   ├── MediaAttachmentToolbar.tsx    # Media upload toolbar
│   └── index.ts                      # Component exports
├── hooks/
│   ├── useQuestionValidation.ts      # Validation logic
│   └── index.ts                      # Hook exports
├── api.ts                            # API service layer
├── context.tsx                       # React Context for state management
├── types.ts                          # TypeScript type definitions
├── utils.ts                          # Utility functions
├── index.ts                          # Main feature export
└── README.md                         # This file
```

## Usage

### Basic Integration

```tsx
import { QuestionBuilderProvider, QuestionBuilder } from '../features/questions'

function MyPage() {
  const assignmentId = "your-assignment-id"

  return (
    <QuestionBuilderProvider assignmentId={assignmentId}>
      <QuestionBuilder assignmentId={assignmentId} />
    </QuestionBuilderProvider>
  )
}
```

### Using the Context

```tsx
import { useQuestionBuilder } from '../features/questions'

function MyComponent() {
  const {
    state,
    currentQuestion,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    saveAllQuestions,
  } = useQuestionBuilder()

  // Use the context methods...
}
```

## Components

### QuestionBuilder

Main container component that provides the complete question builder UI.

**Props:**
- `assignmentId: string` - The assignment ID
- `className?: string` - Optional CSS classes

**Features:**
- Question list sidebar
- Question editor area
- Add question button
- Save all button
- Stats footer

### QuestionEditor

Editor component for individual questions.

**Features:**
- Question type toggle (Multiple Choice / Essay)
- Content text area
- Media attachment toolbar
- Multiple choice options (when applicable)
- Delete button with confirmation

### QuestionList

Sidebar component for navigation and reordering.

**Features:**
- Question previews
- Current question highlighting
- Move up/down buttons
- Question count
- Save status indicators

### QuestionTypeToggle

Toggle component for selecting question type.

**Props:**
- `value: QuestionType` - Current type
- `onChange: (type: QuestionType) => void` - Change handler
- `disabled?: boolean` - Disable state
- `className?: string` - Optional CSS classes

### MultipleChoiceOptions

Component for managing multiple choice options.

**Features:**
- Add/remove options
- Edit option text
- Select correct answer (radio button)
- Minimum one option enforcement

### MediaAttachmentToolbar

Toolbar for uploading and managing media.

**Features:**
- Upload buttons (Image / Audio / Video)
- File validation
- Media previews
- Delete media
- Upload progress indicator

## State Management

### Context Structure

```typescript
interface QuestionBuilderState {
  questions: DraftQuestion[]
  currentQuestionId: string | null
  isLoading: boolean
  error: string | null
  isDirty: boolean
}
```

### Draft Question Structure

```typescript
interface DraftQuestion {
  id: string                    // Local UUID
  type: QuestionType            // 'multiple_choice' | 'essay'
  content: string               // Question text
  order: number                 // Display order
  options: QuestionOption[]     // MC options
  media: MediaAttachment[]      // Attached media
  isSaved: boolean              // Sync status
  backendId?: string            // Backend ID after save
}
```

### Persistence

The Question Builder automatically persists state to `sessionStorage`:
- Saved on every state change
- Restored on page refresh
- Cleared on reset
- Keyed by assignment ID

Storage key format: `baitapvui_question_builder_{assignmentId}`

## API Integration

### Endpoints Used

```typescript
// Question endpoints
POST   /api/v1/assignments/:assignmentId/questions
GET    /api/v1/assignments/:assignmentId/questions
PUT    /api/v1/questions/:id
DELETE /api/v1/questions/:id
PUT    /api/v1/assignments/:assignmentId/questions/reorder

// Media endpoints
POST   /api/v1/media/upload
GET    /api/v1/media/:mediaId
DELETE /api/v1/media/:mediaId
```

### Error Handling

The API layer uses `QuestionApiError` class for structured error handling:

```typescript
try {
  await questionApi.createQuestion(assignmentId, data)
} catch (error) {
  if (error instanceof QuestionApiError) {
    console.error(error.message)
    console.error(error.code)
    console.error(error.fieldErrors)
  }
}
```

## Validation

### Question Validation Rules

**All Questions:**
- Content is required (non-empty)

**Multiple Choice Questions:**
- At least one option required
- All options must have text
- At least one correct answer required

### Media Validation

**Image:**
- Types: PNG, JPG, GIF
- Max size: 10MB

**Audio:**
- Types: MP3, WAV
- Max size: 50MB

**Video:**
- Types: MP4, WEBM
- Max size: 100MB

## Accessibility

The Question Builder implements ARIA attributes and keyboard navigation:

- All interactive elements are keyboard accessible
- Radio buttons have proper labels
- Buttons have descriptive `aria-label` attributes
- Error messages are associated with inputs
- Focus management for navigation

## Responsive Design

The layout adapts to different screen sizes:

- Desktop: Side-by-side layout (list + editor)
- Tablet: Adjustable sidebar width
- Mobile: Consider implementing tab-based navigation (future enhancement)

## Performance Considerations

### Optimizations

- **Memoization**: Context value and computations are memoized
- **Lazy Updates**: State updates are batched via React
- **Debouncing**: Consider adding debounce for content input (future)
- **Virtual Scrolling**: Consider for large question lists (future)

### Best Practices

- Use `useCallback` for event handlers
- Use `useMemo` for derived state
- Avoid unnecessary re-renders with proper React patterns

## Testing Strategy

### Unit Tests

Test individual components in isolation:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import QuestionTypeToggle from './QuestionTypeToggle'

test('changes question type on click', () => {
  const onChange = jest.fn()
  render(<QuestionTypeToggle value="essay" onChange={onChange} />)

  fireEvent.click(screen.getByText('Multiple Choice'))
  expect(onChange).toHaveBeenCalledWith('multiple_choice')
})
```

### Integration Tests

Test component interactions with context:

```tsx
test('adds question when button clicked', async () => {
  render(
    <QuestionBuilderProvider assignmentId="test">
      <QuestionBuilder assignmentId="test" />
    </QuestionBuilderProvider>
  )

  fireEvent.click(screen.getByText('Add Question'))
  expect(await screen.findByText('Question 1')).toBeInTheDocument()
})
```

## Future Enhancements

### Planned Features

1. **Drag-and-Drop Reordering** (KAN-77 enhancement)
   - Integrate `@dnd-kit/core` for smoother UX
   - Touch-friendly drag handles

2. **Rich Text Editor**
   - Support for formatted text in questions
   - Math equation support (MathJax/KaTeX)

3. **Question Templates**
   - Save frequently used question patterns
   - Quick-start templates

4. **Bulk Operations**
   - Import questions from CSV/JSON
   - Export questions
   - Duplicate questions

5. **Advanced Media**
   - Image cropping/editing
   - Audio recording in-browser
   - YouTube video embedding

6. **Collaboration**
   - Real-time editing (WebSocket)
   - Change tracking
   - Comments on questions

## Troubleshooting

### Common Issues

**Questions not saving:**
- Check network tab for API errors
- Verify authentication token is valid
- Check validation errors in console

**State not persisting:**
- Check sessionStorage quota
- Verify assignmentId is consistent
- Check browser privacy settings

**Media upload failing:**
- Verify file size is within limits
- Check file type is supported
- Check backend CORS settings

### Debug Mode

Enable debug logging:

```typescript
// In context.tsx, add logging
useEffect(() => {
  console.log('[QuestionBuilder] State updated:', state)
}, [state])
```

## Contributing

When adding new features to the Question Builder:

1. Update types in `types.ts`
2. Add API functions in `api.ts`
3. Update context in `context.tsx`
4. Create/update components in `components/`
5. Add custom hooks in `hooks/` if needed
6. Update this README
7. Write tests

## Support

For issues or questions:
- Check existing GitHub issues
- Review the project documentation
- Contact the development team

---

**Last Updated:** January 24, 2026
**Version:** 1.0.0
**Maintainer:** BaiTapVui Development Team

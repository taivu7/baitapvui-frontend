# Question Builder - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Import the Components

```tsx
import {
  QuestionBuilderProvider,
  QuestionBuilder,
} from './features/questions'
```

### Step 2: Wrap Your Component

```tsx
function MyPage() {
  const assignmentId = "your-assignment-id"

  return (
    <QuestionBuilderProvider assignmentId={assignmentId}>
      <QuestionBuilder assignmentId={assignmentId} />
    </QuestionBuilderProvider>
  )
}
```

### Step 3: That's It!

The Question Builder is now fully functional with:
- ✅ Question CRUD operations
- ✅ Multiple choice and essay types
- ✅ Media attachments
- ✅ Reordering
- ✅ Auto-save to sessionStorage
- ✅ Backend synchronization

---

## 📋 Common Use Cases

### Use Case 1: Add to Assignment Creation Flow

```tsx
// In your assignment creation page
import { QuestionBuilderProvider, QuestionBuilder } from './features/questions'

function AssignmentCreatePage() {
  const [assignmentId, setAssignmentId] = useState<string | null>(null)

  const handleCreateAssignment = async () => {
    // Create assignment first
    const response = await createAssignment(formData)
    setAssignmentId(response.id)
  }

  return (
    <div>
      {/* Step 1: Basic info form */}
      <AssignmentBasicInfoForm onSave={handleCreateAssignment} />

      {/* Step 2: Question builder (after assignment created) */}
      {assignmentId && (
        <QuestionBuilderProvider assignmentId={assignmentId}>
          <QuestionBuilder assignmentId={assignmentId} />
        </QuestionBuilderProvider>
      )}
    </div>
  )
}
```

### Use Case 2: Add to Routes

```tsx
// In your App.tsx or routes file
import QuestionBuilderPage from './pages/QuestionBuilderPage'

<Route
  path="/assignments/:assignmentId/questions"
  element={<QuestionBuilderPage />}
/>
```

### Use Case 3: Custom UI with Context

```tsx
import { useQuestionBuilder } from './features/questions'

function CustomQuestionManager() {
  const {
    state,
    addQuestion,
    saveAllQuestions,
  } = useQuestionBuilder()

  return (
    <div>
      <h2>Total Questions: {state.questions.length}</h2>
      <button onClick={() => addQuestion('multiple_choice')}>
        Add MC Question
      </button>
      <button onClick={saveAllQuestions}>
        Save All
      </button>
    </div>
  )
}
```

---

## 🎨 Customization Examples

### Custom Styling

```tsx
<QuestionBuilder
  assignmentId={assignmentId}
  className="my-custom-class"
/>
```

### Custom Empty State

```tsx
// Modify QuestionBuilder.tsx
{state.questions.length === 0 && (
  <YourCustomEmptyState />
)}
```

### Add Validation Feedback

```tsx
import { useQuestionValidation } from './features/questions'

function QuestionWithValidation({ question }) {
  const { isValid, errors } = useQuestionValidation(question)

  return (
    <div>
      <QuestionEditor question={question} />
      {!isValid && (
        <ValidationErrors errors={errors} />
      )}
    </div>
  )
}
```

---

## 🔧 Configuration

### Backend API Base URL

Already configured via `/src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
```

### File Upload Limits

Modify in `/src/features/questions/api.ts`:

```typescript
const maxSizes = {
  image: 10 * 1024 * 1024,  // 10MB
  audio: 50 * 1024 * 1024,  // 50MB
  video: 100 * 1024 * 1024, // 100MB
}
```

### Storage Key

Modify in `/src/features/questions/types.ts`:

```typescript
export const QUESTION_BUILDER_STORAGE_KEY = 'your_custom_key'
```

---

## 🐛 Debugging

### Enable Debug Logging

```tsx
// In context.tsx
useEffect(() => {
  console.log('[QuestionBuilder] State updated:', state)
}, [state])
```

### Check sessionStorage

```javascript
// Browser console
const data = sessionStorage.getItem('baitapvui_question_builder_YOUR_ASSIGNMENT_ID')
console.log(JSON.parse(data))
```

### Monitor API Calls

Open DevTools → Network tab → Filter by:
- `assignments/{id}/questions`
- `questions/{id}`
- `media/upload`

---

## ✅ Checklist Before Going Live

### Frontend
- [ ] Components render without errors
- [ ] Questions can be added/edited/deleted
- [ ] Media uploads work
- [ ] Reordering works
- [ ] State persists on refresh
- [ ] Validation shows correct errors
- [ ] Dark mode works

### Backend
- [ ] All API endpoints implemented
- [ ] CORS configured
- [ ] File upload storage configured
- [ ] Authentication working
- [ ] Rate limiting enabled
- [ ] Error responses formatted correctly

### Testing
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Manual testing completed
- [ ] Edge cases tested
- [ ] Error handling tested

---

## 📚 Next Steps

1. **Review the full documentation:**
   - `/src/features/questions/README.md`
   - `/baitapvui-frontend/QUESTION_BUILDER_IMPLEMENTATION.md`

2. **Customize components:**
   - Modify UI in `/src/features/questions/components/`
   - Add custom hooks in `/src/features/questions/hooks/`

3. **Add tests:**
   - Create test files alongside components
   - Use React Testing Library

4. **Enhance features:**
   - Add drag-and-drop (see README for suggestions)
   - Implement rich text editor
   - Add question templates

---

## 🆘 Need Help?

### Common Questions

**Q: How do I add a new question type?**
A: Update `QuestionType` in `types.ts`, add UI in `QuestionEditor.tsx`, update validation in `api.ts`

**Q: Can I use this outside the context?**
A: No, components must be wrapped in `QuestionBuilderProvider`

**Q: How do I customize the layout?**
A: Modify `QuestionBuilder.tsx` directly or create your own layout using the context

**Q: Is drag-and-drop supported?**
A: Not yet, but the `reorderQuestions` function is ready for DnD library integration

---

## 🎯 Pro Tips

1. **Save frequently:** Use `saveAllQuestions()` before navigation
2. **Validate before save:** Use `useQuestionValidation` hook
3. **Handle errors:** Wrap API calls in try-catch
4. **Test persistence:** Refresh page to verify sessionStorage
5. **Monitor state:** Use React DevTools to inspect context

---

**Happy Coding! 🎉**

For detailed documentation, see:
- [README.md](./README.md) - Feature documentation
- [QUESTION_BUILDER_IMPLEMENTATION.md](../../../QUESTION_BUILDER_IMPLEMENTATION.md) - Full implementation details

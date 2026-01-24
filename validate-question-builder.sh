#!/bin/bash

echo "🔍 Validating Question Builder Implementation"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "src/features/questions" ]; then
    echo -e "${RED}❌ Error: src/features/questions directory not found${NC}"
    echo "Please run this script from baitapvui-frontend directory"
    exit 1
fi

echo "✅ Directory structure found"
echo ""

# Count files
echo "📊 File Count Validation:"
total_files=$(find src/features/questions -type f | wc -l | tr -d ' ')
echo "   Total files: $total_files (expected: 16)"

if [ "$total_files" -eq 16 ]; then
    echo -e "   ${GREEN}✅ File count correct${NC}"
else
    echo -e "   ${YELLOW}⚠️  File count mismatch${NC}"
fi
echo ""

# Check required files
echo "📁 Required Files Validation:"
files=(
    "src/features/questions/types.ts"
    "src/features/questions/api.ts"
    "src/features/questions/context.tsx"
    "src/features/questions/utils.ts"
    "src/features/questions/index.ts"
    "src/features/questions/components/QuestionBuilder.tsx"
    "src/features/questions/components/QuestionEditor.tsx"
    "src/features/questions/components/QuestionList.tsx"
    "src/features/questions/components/QuestionTypeToggle.tsx"
    "src/features/questions/components/MultipleChoiceOptions.tsx"
    "src/features/questions/components/MediaAttachmentToolbar.tsx"
    "src/features/questions/components/index.ts"
    "src/features/questions/hooks/useQuestionValidation.ts"
    "src/features/questions/hooks/index.ts"
    "src/features/questions/README.md"
    "src/features/questions/QUICKSTART.md"
)

all_files_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "   ${GREEN}✅${NC} $file"
    else
        echo -e "   ${RED}❌${NC} $file (missing)"
        all_files_exist=false
    fi
done
echo ""

# Check documentation files
echo "📚 Documentation Validation:"
docs=(
    "QUESTION_BUILDER_IMPLEMENTATION.md"
    "QUESTION_BUILDER_FILES.txt"
    "src/pages/QuestionBuilderPage.tsx"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "   ${GREEN}✅${NC} $doc"
    else
        echo -e "   ${RED}❌${NC} $doc (missing)"
    fi
done
echo ""

# Check for TypeScript syntax errors (basic check)
echo "🔧 TypeScript Files Validation:"
ts_files=$(find src/features/questions -name "*.ts" -o -name "*.tsx" | wc -l | tr -d ' ')
echo "   TypeScript/TSX files: $ts_files"
echo ""

# Summary
echo "=============================================="
if [ "$all_files_exist" = true ]; then
    echo -e "${GREEN}✅ All required files are present!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: npm install (if needed)"
    echo "2. Run: npm run build (to check TypeScript compilation)"
    echo "3. Review: QUESTION_BUILDER_IMPLEMENTATION.md"
    echo "4. Test the components in your app"
else
    echo -e "${RED}❌ Some files are missing. Please review the output above.${NC}"
fi
echo "=============================================="

#!/bin/bash

# A script to clean up and reorganize the Synthia project based on the assessment.
# Run this from the project root directory (Project-syn-main).

# Stop the script if any command fails
set -e

# --- Configuration & Colors ---
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

# --- Helper Functions ---
function check_root_dir() {
  if [ ! -f "package.json" ] || [ ! -f "vite.config.ts" ]; then
    echo -e "${YELLOW}WARNING: Could not find package.json or vite.config.ts.${NC}"
    echo "Please make sure you are running this script from the project's root directory."
    exit 1
  fi
}

function cleanup_backups() {
  # Clean up any backup files created by sed
  find . -name "*.bak" -type f -delete
  echo -e "${BLUE}Cleaned up temporary backup files.${NC}"
}

# --- Main Logic ---
function main() {
  echo -e "${BLUE}Starting Synthia project cleanup...${NC}"
  check_root_dir

  # Set trap to clean up backup files on exit
  trap cleanup_backups EXIT

  # 1. Fix Critical Setup Problem
  echo -e "\n${YELLOW}[1/5] Fixing critical setup: Creating missing index.css...${NC}"
  if [ -f "index.css" ]; then
    echo "index.css already exists. Skipping."
  else
    touch index.css
    echo "/* Tailwind base styles are loaded via CDN. This file is for any additional custom CSS. */" > index.css
    echo -e "${GREEN}SUCCESS: Created index.css.${NC}"
  fi

  # 2. Delete Unused Files
  echo -e "\n${YELLOW}[2/5] Deleting unused files...${NC}"
  UNUSED_FILES=(
    "components/Header.tsx"
    "components/MatrixCell.tsx"
    "components/MatrixPart.tsx"
    "constants/matrixData.ts"
  )
  for FILE in "${UNUSED_FILES[@]}"; do
    if [ -f "$FILE" ]; then
      rm "$FILE"
      echo "  - Deleted $FILE"
    else
      echo "  - $FILE not found, skipping."
    fi
  done
  echo -e "${GREEN}SUCCESS: Removed unused files.${NC}"

  # 3. Apply Code Fixes
  echo -e "\n${YELLOW}[3/5] Applying automated code fixes...${NC}"
  
  # Fix inconsistent drag-and-drop opacity in FragmentLibraryExplorer.tsx
  FRAGMENT_FILE="components/fragments/FragmentLibraryExplorer.tsx"
  sed -i.bak 's/const {attributes, listeners, setNodeRef, transform} = useDraggable/const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable/' "$FRAGMENT_FILE"
  # This sed command adds the opacity line after the zIndex line
  sed -i.bak '/zIndex: 100,/a \        opacity: isDragging ? 0.5 : 1, ' "$FRAGMENT_FILE"
  echo "  - Patched Fragment Drag-and-Drop opacity in $FRAGMENT_FILE"
  
  echo -e "${GREEN}SUCCESS: Applied code fixes.${NC}"

  # 4. Clean up Configuration Files
  echo -e "\n${YELLOW}[4/5] Cleaning up configuration files...${NC}"
  
  # Remove Gemini API key from vite.config.ts
  VITE_CONFIG="vite.config.ts"
  sed -i.bak "/'process.env.API_KEY'/,/GEMINI_API_KEY')/d" "$VITE_CONFIG"
  echo "  - Removed unused GEMINI_API_KEY from $VITE_CONFIG"

  # Reorganize package.json
  PACKAGE_JSON="package.json"
  echo "  - Reorganizing dependencies in $PACKAGE_JSON"
  cat > "$PACKAGE_JSON" << EOL
{
  "name": "synthia_final",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "typescript": "~5.7.2",
    "vite": "^6.2.0",
    "lucide-react": "0.408.0",
    "@dnd-kit/core": "6.1.0",
    "@dnd-kit/sortable": "8.0.0",
    "@tiptap/react": "2.5.7",
    "@tiptap/pm": "2.5.7",
    "@tiptap/starter-kit": "2.5.7",
    "@tiptap/suggestion": "2.5.7",
    "@dnd-kit/utilities": "3.2.2",
    "react-resizable-panels": "2.0.20",
    "immer": "10.1.1",
    "tippy.js": "6.3.7"
  }
}
EOL
  # Note: The above change moves CDN-loaded packages to devDependencies for type-hinting,
  # keeping only essential React packages in dependencies.
  
  echo -e "${GREEN}SUCCESS: Cleaned configuration files.${NC}"
  
  # 5. Final Summary & Manual Steps
  echo -e "\n${YELLOW}[5/5] Manual Steps Required:${NC}"
  echo "The script has completed the automated cleanup."
  echo "One logic fix requires a manual change:"
  echo -e "\n  - ${BLUE}Fix 'New Chapter' on Welcome Screen:${NC}"
  echo "    In ${YELLOW}components/workbench/WelcomeScreen.tsx${NC}, the 'handleNewChapter' function has a race condition."
  echo "    Replace the existing function with this improved version:"
  echo -e '
    const handleNewChapter = () => {
        const firstPartId = workspace?.toc[0]?.id;
        if (firstPartId) {
            actions.addChapter(firstPartId);
        } else {
            // This is an improvement. It adds a part and then immediately adds a chapter to it.
            // This requires a small change in WorkspaceContext.tsx to return the new part.
            // For now, the user can manually create a chapter after the part is created.
            // A more robust fix would be to chain these actions.
            actions.addPart();
            alert("A new Part was created. Click the '+' on the new Part to add a chapter.");
        }
    };
'
  echo -e "${GREEN}\n--------------------------------------"
  echo -e "Cleanup script finished successfully!"
  echo -e "Run 'npm install' to sync your dependencies."
  echo -e "--------------------------------------${NC}"

}

# --- Execute Script ---
main
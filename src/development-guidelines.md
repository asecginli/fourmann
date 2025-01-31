# Development Guidelines

## General notes for bolt.new AI  
You will be penalized every time functionality is destroyed when you comment code that requires changes with `(previous script content remains exactly the same)` or `Previous script content remains exactly the same`. Always produce complete code!

## HTML Tag Conventions

### Element Closing
- ALWAYS use explicit closing tags for non-void HTML elements
- NEVER use self-closing syntax (`/>`) for non-void elements
  ```html
  <!-- ✅ Correct -->
  <div class="container"></div>
  
  <!-- ❌ Incorrect -->
  <div class="container" />
  ```
- Only use self-closing syntax for void elements (e.g., `<img />`, `<input />`, `<br />`)
- This prevents ambiguity warnings in Svelte components

## Svelte 5 Syntax Requirements

### Runes Usage
- ALWAYS use Svelte 5 Runes syntax
- NEVER use legacy Svelte syntax with '$' prefix
- Use `let` with `$state` for reactive state declarations:
  ```ts
  // ✅ Correct
  let count = $state(0);
  let items = $state<string[]>([]);
  
  // ❌ Incorrect
  const count = $state(0);
  $: doubled = count * 2;
  ```

### Props Declaration
- Use `$props` for component props:
  ```ts
  // ✅ Correct
  const props = $props<{
    title: string;
    onSubmit: () => void;
  }>();
  
  // ❌ Incorrect
  export let title: string;
  export let onSubmit: () => void;
  ```

### Derived Values
- Use `$derived` for computed values:
  ```ts
  // ✅ Correct
  let total = $derived(items.reduce((sum, item) => sum + item.price, 0));
  
  // ❌ Incorrect
  $: total = items.reduce((sum, item) => sum + item.price, 0);
  ```

## XML Content Requirements

### Schema Validation
- ALL XML files MUST validate against their corresponding XSD schema
- The schema file MUST be named the same as the XML file with `.xsd` extension
- Schema files MUST be kept in sync with XML structure changes
- NEVER modify XML files without updating the schema if needed

### XML File Updates
When updating XML files:
1. Check if changes require schema updates
2. Update the schema first if needed
3. Validate the XML against the updated schema
4. Commit both schema and XML changes together

### Markdown in XML
- ALWAYS wrap markdown content in CDATA sections when inside XML elements
- This prevents XML parsing errors from special characters in markdown
  ```xml
  <!-- ✅ Correct -->
  <content><![CDATA[
  ## Heading

  - List item 1
  - List item 2

  > Blockquote
  ]]></content>
  
  <!-- ❌ Incorrect -->
  <content>
  ## Heading

  - List item 1
  - List item 2

  > Blockquote
  </content>
  ```

## Accessibility (a11y) Requirements

### Zero Warnings Policy
- All components MUST have zero a11y warnings
- Run accessibility checks during development
- Fix warnings immediately when detected

### Button Requirements
- All buttons MUST have:
  - Descriptive text or aria-label
  - Proper role attribute when needed
  - Keyboard navigation support
  ```html
  <!-- ✅ Correct -->
  <button 
    type="button"
    aria-label="Toggle menu"
    class="toolbar-btn"
  >
    <svg aria-hidden="true">...</svg>
  </button>
  
  <!-- ❌ Incorrect -->
  <button class="toolbar-btn">
    <svg>...</svg>
  </button>
  ```

### Form Controls
- All form inputs MUST have:
  - Associated labels
  - Proper aria attributes
  - Clear error states
  ```html
  <!-- ✅ Correct -->
  <label for="name">Full Name</label>
  <input 
    id="name"
    type="text"
    aria-invalid={hasError}
    aria-describedby="name-error"
  />
  <div id="name-error" role="alert">
    {errorMessage}
  </div>
  
  <!-- ❌ Incorrect -->
  <input type="text" placeholder="Enter name" />
  ```

### Interactive Elements
- Ensure proper focus management
- Maintain logical tab order
- Provide visible focus indicators
- Support keyboard interactions

### ARIA Landmarks
- Use appropriate landmark roles
- Ensure unique landmark labels
- Maintain proper nesting
  ```html
  <!-- ✅ Correct -->
  <header role="banner">
    <nav aria-label="Main">...</nav>
  </header>
  <main role="main">...</main>
  <footer role="contentinfo">...</footer>
  ```

## Code Style

### TypeScript
- Use strict type checking
- Avoid `any` types
- Define interfaces for data structures
- Use type assertions sparingly

### Component Structure
- Keep components focused and single-purpose
- Extract reusable logic into separate files
- Follow a consistent file organization pattern

### CSS/Styling
- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Maintain consistent spacing and sizing

## Performance Considerations

### State Management
- Keep state as local as possible
- Use `$derived` for computed values
- Avoid unnecessary state updates

### Rendering Optimization
- Use proper keying for lists
- Avoid expensive computations in render
- Lazy load components when appropriate

## Testing Requirements

### Component Testing
- Test all user interactions
- Verify accessibility features
- Test responsive behavior

### State Testing
- Verify state transitions
- Test derived state calculations
- Check error handling

## Documentation

### Component Documentation
- Document props and events
- Include usage examples
- Document accessibility features

### Code Comments
- Explain complex logic
- Document workarounds
- Include references to related code

## Markdown Editor Component

### Features and Functionality
- Rich text editing with markdown output
- Preview mode with live rendering
- Support for:
  - Headers (H1-H3)
  - Lists (ordered and unordered)
  - Code blocks
  - Blockquotes
  - Images with captions
  - Links
  - Basic text formatting

### Data Storage
- Raw markdown stored in `value` array
- Editor state stored in `data.editorData` as object (not string)
- HTML tags are cleaned from markdown output
- Links properly converted to markdown format

### Editor Configuration
- Uses Editor.js with following plugins:
  - Header
  - List
  - Quote
  - Code
  - Image
- Custom image uploader for base64 storage
- Toolbar with essential formatting options
- Full-width content area

### Styling Requirements
- Consistent typography with system theme
- Proper spacing and margins
- Responsive design
- Accessible color contrast
- Clear visual hierarchy
- Custom scrollbars
- Smooth transitions

### Preview Mode
- Toggle between edit and preview
- Live markdown rendering
- Maintains scroll position
- Proper cleanup on mode switch
- Consistent styling with editor

### State Management
- Clean editor initialization/destruction
- Proper content preservation
- Error handling for invalid markdown
- Preview updates on content change

### Accessibility
- ARIA labels for all controls
- Keyboard navigation support
- Proper focus management
- Screen reader compatibility
- Clear visual feedback
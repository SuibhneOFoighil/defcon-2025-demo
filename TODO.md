# Ludus Viewport Integration TODO

## Project Goal
Create a viewport using an iframe in shell-n-slides that displays a mock page from the Ludus GUI Next.js application. This will serve as an overlay window for slides to demonstrate basic application functionality.

## Phase 1: Setup & Mock Page Creation

### Ludus GUI (Next.js) Tasks
- [ ] Create a new viewport demo page at `/app/viewport-demo/page.tsx`
- [ ] Design a simplified mock interface showcasing key Ludus features
- [ ] Ensure the page works well in iframe context (responsive, no layout issues)
- [ ] Add basic interactive elements for demonstration purposes
- [ ] Test page accessibility and functionality when embedded

### Shell-n-Slides Tasks
- [ ] Analyze current iframe implementation in terminal section
- [ ] Plan viewport integration alongside or replacing terminal iframe
- [ ] Design viewport controls and overlay functionality
- [ ] Update layout to accommodate new viewport pane

## Phase 2: Integration Implementation

### Layout & UI
- [ ] Modify `index.html` to include viewport iframe section
- [ ] Update `styles.css` for new pane layout (3-pane or tabbed interface)
- [ ] Implement viewport controls (show/hide, resize, basic interactions)
- [ ] Ensure responsive design works with new viewport

### JavaScript Functionality
- [ ] Update `script.js` to handle viewport iframe initialization
- [ ] Add viewport source URL configuration
- [ ] Implement communication between slides and viewport
- [ ] Add viewport reset/refresh functionality
- [ ] Handle viewport loading states and error handling

## Phase 3: Enhancement & Polish

### Features
- [ ] Add viewport overlay controls (minimize, maximize, close)
- [ ] Implement slide-triggered viewport actions
- [ ] Add viewport state persistence across slide navigation
- [ ] Create viewport interaction tutorials within slides

### Testing & Optimization
- [ ] Test iframe security and sandbox settings
- [ ] Verify cross-origin communication if needed
- [ ] Optimize performance with multiple iframes
- [ ] Test on different screen sizes and devices
- [ ] Validate accessibility compliance

## Phase 4: Documentation & Deployment

### Documentation
- [ ] Document viewport configuration options
- [ ] Create slides demonstrating viewport usage
- [ ] Update README with new viewport functionality
- [ ] Document iframe security considerations

### Deployment Preparation
- [ ] Ensure both applications can run simultaneously
- [ ] Configure port settings for development/production
- [ ] Test offline deployment scenario
- [ ] Validate self-hosted environment compatibility

## Technical Considerations

### Architecture Decisions
- **Layout**: 3-pane (slides + viewport + terminal) vs tabbed interface
- **Communication**: PostMessage API for slide-viewport interaction
- **Sizing**: Fixed vs responsive viewport dimensions
- **Content**: Static mock vs dynamic Ludus GUI integration

### Security & Performance
- **Iframe sandbox**: Appropriate sandbox attributes for security
- **CORS**: Cross-origin resource sharing configuration
- **Performance**: Impact of multiple iframes on page load
- **Memory**: Resource cleanup when switching slides

### Development Environment
- **Port Management**: Ludus GUI (3000) + Shell-n-Slides (8080) + Terminal (7681)
- **Hot Reload**: Ensure viewport updates with Next.js dev changes
- **Debugging**: Tools for iframe communication debugging

## Success Criteria
- [ ] Viewport displays Ludus GUI mock page within slides
- [ ] Smooth integration with existing slide navigation
- [ ] Responsive design works across devices
- [ ] Basic interactive demonstrations function properly
- [ ] No security vulnerabilities introduced
- [ ] Performance impact is minimal
- [ ] Documentation is complete and clear

## Notes
- Existing terminal iframe implementation provides good reference
- Shell-n-slides already has resizable pane functionality
- Consider viewport as educational/demo tool rather than full application
- Maintain offline deployment capability throughout implementation
# WebSim.ai

WebSim.ai is an AI-powered web application generator that creates responsive, accessible web components based on natural language descriptions. It features an interactive browser-like interface with real-time editing capabilities and version control.

## Features

### Core Functionality
- **AI-Powered Generation**: Convert natural language descriptions into functional web components
- **Enhanced LLM Output**: Context-aware generation with improved prompts and formatting
- **Image Integration**: Automatic image search and integration via Pixabay
- **Responsive Layouts**: Smart layout generation based on content requirements

### Interactive Editing
- **Context Menu**: Right-click any element to:
  - Edit content with AI assistance
  - Modify styles
  - Duplicate elements
  - Delete elements
- **Real-time Preview**: See changes instantly in the simulated browser
- **Element Information**: View technical details of selected elements

### Version Control
- **History Panel**: Track all changes and versions
- **Revision System**: Submit changes through the side panel
- **Version Restoration**: Easily switch between different versions
- **Change Descriptions**: Detailed logs of modifications

### Prompt System

The application uses a sophisticated prompt system organized by type and context:

#### System Prompts
```env
SYSTEM: {
    CODE: {
        INITIAL: "Focus on generating semantic HTML...",
        EDIT: "Modify existing code while maintaining structure...",
        REVISION: "Update existing code based on feedback..."
    },
    LAYOUT: {
        INITIAL: "Analyze user needs and create layouts...",
        EDIT: "Modify layout while maintaining structure...",
        REVISION: "Adjust layout based on feedback..."
    },
    IMAGE: {
        INITIAL: "Handle images with proper optimization...",
        EDIT: "Modify image presentation...",
        REVISION: "Update image handling..."
    }
}
```

#### Agent Prompts
```env
AGENTS: {
    CODE: {
        INITIAL: "Generate clean, semantic code...",
        EDIT: "Modify specific code elements...",
        ELEMENT_EDIT: "Update selected element...",
        STYLE_EDIT: "Modify styles..."
    },
    LAYOUT: {
        INITIAL: "Create responsive layouts...",
        EDIT: "Adjust layout structure...",
        COMPONENT: "Design specific components..."
    },
    IMAGE: {
        INITIAL: "Select and optimize images...",
        EDIT: "Modify image presentation...",
        GALLERY: "Create image galleries..."
    }
}
```

#### Context Prompts
```env
CONTEXT: {
    ELEMENT_EDIT: "Editing specific element...",
    STYLE_EDIT: "Modifying element styles...",
    REVISION: "Making broader changes...",
    COMPONENT: "Working with components..."
}
```

## Project Structure

```
websim/
├── src/
│   ├── agents/              # AI agent system
│   │   ├── BaseAgent.ts     # Base agent with prompt handling
│   │   ├── CodeAgent.ts     # Code generation agent
│   │   ├── ImageAgent.ts    # Image handling agent
│   │   ├── LayoutAgent.ts   # Layout management agent
│   │   └── AgentOrchestrator.ts # Agent coordination
│   ├── components/          # React components
│   │   ├── BrowserSimulator.tsx # Main interface
│   │   ├── ContextMenu.tsx  # Right-click menu
│   │   └── VersionControl.tsx # Version management
│   ├── services/           # Core services
│   │   ├── api/           # API integrations
│   │   ├── cache/         # Caching system
│   │   └── ratelimiter/   # Rate limiting
│   ├── config/            # Configuration
│   └── utils/             # Utility functions
```

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd websim
```

2. Install dependencies:
```bash
npm install
```

3. Environment Setup:
   
   a. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   b. Edit `.env` and add your API keys:
   ```env
   NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_key
   NEXT_PUBLIC_PIXABAY_API_KEY=your_pixabay_key
   ```
   
   > ⚠️ **Security Note**: Never commit your `.env` file to version control. The `.gitignore` file is configured to exclude it.

   Required API Keys:
   - OpenRouter API key: Get it from [OpenRouter](https://openrouter.ai/)
   - Pixabay API key: Get it from [Pixabay](https://pixabay.com/api/docs/)

4. Start the development server:
```bash
npm run dev
```

## Usage Guide

### Initial Generation
1. Enter a description in the URL bar
2. Click "Generate" or press Enter
3. Wait for the content to be generated
4. View the result in the simulated browser

### Element Editing
1. Right-click any element in the generated content
2. Choose from available options:
   - "Edit Content": Modify element content with AI assistance
   - "Edit Style": Change element styling
   - "Duplicate": Create a copy of the element
   - "Delete": Remove the element

### Version Control
1. Use the side panel to view version history
2. Enter revision prompts in the input box
3. Submit changes to create new versions
4. Click on any version to restore it

### Tips for Best Results
- Be specific in your descriptions
- Use the revision system for incremental changes
- Leverage the context menu for precise edits
- Check version history before making major changes

## Development Guidelines

### Adding New Features
1. Create new agents in `src/agents/` if needed
2. Update `AgentOrchestrator` to handle new agent interactions
3. Add necessary environment variables to `.env`
4. Update constants in `src/config/constants.ts`

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Maintain proper error handling
- Add appropriate comments

### Testing
```bash
npm test           # Run all tests
npm run test:watch # Watch mode
```

### Common Issues

1. **API Key Errors**:
   - Ensure keys are properly set in `.env`
   - Check NEXT_PUBLIC_ prefix for client-side access
   - Never commit API keys to version control

2. **Generation Issues**:
   - Check rate limiting settings
   - Verify API responses
   - Monitor console for errors

3. **UI Problems**:
   - Clear browser cache
   - Check console for React errors
   - Verify component mounting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

Important: Never commit sensitive information like API keys. Use environment variables and keep them secure.

## Security

- Keep your API keys secure and never commit them to version control
- Use `.env` for local development
- Use secure environment variables for production deployment
- Regularly rotate API keys
- Monitor API usage for unusual activity

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support:
1. Check the documentation
2. Review existing issues
3. Create a new issue if needed

## Roadmap

- Enhanced AI generation capabilities
- More interactive editing features
- Collaborative editing support
- Custom component library
- Advanced version control features
- Export functionality improvements

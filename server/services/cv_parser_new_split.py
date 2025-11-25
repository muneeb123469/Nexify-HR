def split_sections(text):
    """Improved section splitter that properly separates sections by headings."""
    sections = {}
    current_section = "summary"
    current_lines = []
    
    for line in text.splitlines():
        line_stripped = line.strip()
        line_lower = line_stripped.lower()
        
        # Skip empty lines
        if not line_stripped:
            current_lines.append(line)
            continue
        
        # Check if this line is a section heading
        # A section heading is typically: short, matches a known heading, and often standalone
        is_heading = False
        matched_heading = None
        
        if len(line_stripped) <= 60:  # Headings are usually short
            # Check for exact matches first
            if line_lower in HEADINGS:
                is_heading = True
                matched_heading = line_lower
            else:
                # Check if line contains any heading keywords
                for heading in HEADINGS:
                    # Must be a substantial match - not just a word in a sentence
                    if heading in line_lower:
                        # Additional validation: check if it's likely a heading
                        # Headings usually don't have much other text
                        words_in_line = len(line_lower.split())
                        words_in_heading = len(heading.split())
                        
                        # If the line is mostly just the heading (within 2-3 extra words)
                        if words_in_line <= words_in_heading + 3:
                            is_heading = True
                            matched_heading = heading
                            break
        
        if is_heading and matched_heading:
            # Save the previous section
            if current_lines:
                sections[current_section] = "\n".join(current_lines).strip()
            
            # Start new section
            current_section = matched_heading
            current_lines = []
            logger.debug(f"Found section heading: '{matched_heading}' from line: '{line_stripped}'")
        else:
            # Add line to current section
            current_lines.append(line)
    
    # Save the last section
    if current_lines:
        sections[current_section] = "\n".join(current_lines).strip()
    
    logger.info(f"Sections detected: {list(sections.keys())}")
    return sections

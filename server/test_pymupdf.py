#!/usr/bin/env python3

try:
    import fitz
    print("✅ PyMuPDF (fitz) imported successfully!")
    print(f"Version: {fitz.version}")
except ImportError as e:
    print(f"❌ Failed to import fitz: {e}")
    
    try:
        import fitz_old as fitz
        print("✅ PyMuPDF (fitz_old) imported successfully!")
        print("Using fitz_old module")
    except ImportError as e2:
        print(f"❌ Failed to import fitz_old: {e2}")
        
        # Check what PyMuPDF related modules are available
        import pkgutil
        modules = [name for _, name, _ in pkgutil.iter_modules()]
        pymupdf_modules = [m for m in modules if 'fitz' in m.lower() or 'mupdf' in m.lower()]
        print(f"Available PyMuPDF-related modules: {pymupdf_modules}")
        
        # Try to find the correct module name
        for module_name in pymupdf_modules:
            try:
                module = __import__(module_name)
                print(f"✅ Successfully imported {module_name}")
                if hasattr(module, 'version'):
                    print(f"Version: {module.version}")
                break
            except Exception as e3:
                print(f"❌ Failed to import {module_name}: {e3}")
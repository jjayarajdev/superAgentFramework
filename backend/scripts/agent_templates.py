"""
Agent Templates Library - Pre-built patterns for common agent types.

Each template includes:
- Config schema fields
- Execute method implementation
- Helper methods
- Common patterns
"""

TEMPLATES = {
    "rest_api": {
        "name": "REST API Agent",
        "description": "Query REST APIs and return structured data",
        "category": "data_retrieval",
        "config_fields": '''base_url: str = Field(
        description="Base URL for the API"
    )
    api_key: Optional[str] = Field(
        default=None,
        description="API key for authentication"
    )
    endpoint: str = Field(
        description="API endpoint to query"
    )
    method: str = Field(
        default="GET",
        description="HTTP method",
        json_schema_extra={"enum": ["GET", "POST", "PUT", "DELETE", "PATCH"]}
    )
    headers: Optional[Dict[str, str]] = Field(
        default=None,
        description="Additional HTTP headers"
    )
    params: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Query parameters"
    )''',
        "execute_method": '''        """Execute REST API call."""
        import httpx

        self.log(f"Calling {self.config.method} {self.config.base_url}{self.config.endpoint}")

        # Build headers
        headers = self.config.headers or {}
        if self.config.api_key:
            headers["Authorization"] = f"Bearer {self.config.api_key}"
        headers["Content-Type"] = "application/json"

        # Build full URL
        url = f"{self.config.base_url}{self.config.endpoint}"

        # Make request
        async with httpx.AsyncClient() as client:
            try:
                if self.config.method == "GET":
                    response = await client.get(url, headers=headers, params=self.config.params)
                elif self.config.method == "POST":
                    response = await client.post(url, headers=headers, json=input_data)
                elif self.config.method == "PUT":
                    response = await client.put(url, headers=headers, json=input_data)
                elif self.config.method == "DELETE":
                    response = await client.delete(url, headers=headers)
                else:
                    response = await client.patch(url, headers=headers, json=input_data)

                response.raise_for_status()
                data = response.json()

                self.log(f"API call successful: {response.status_code}")

                return AgentExecutionResult(
                    success=True,
                    output={"data": data, "status_code": response.status_code},
                    tokens_used=0,
                    cost=0.0
                )

            except httpx.HTTPError as e:
                self.log(f"API call failed: {str(e)}", level="ERROR")
                return AgentExecutionResult(
                    success=False,
                    output={"error": str(e)},
                    error=str(e)
                )''',
        "imports": "import httpx"
    },

    "database": {
        "name": "Database Query Agent",
        "description": "Execute SQL queries and return results",
        "category": "data_retrieval",
        "config_fields": '''connection_string: str = Field(
        description="Database connection string"
    )
    query_type: str = Field(
        default="SELECT",
        description="Type of SQL query",
        json_schema_extra={"enum": ["SELECT", "INSERT", "UPDATE", "DELETE"]}
    )
    table: str = Field(
        description="Database table to query"
    )
    columns: Optional[list] = Field(
        default=None,
        description="Columns to select (for SELECT queries)"
    )
    where: Optional[Dict[str, Any]] = Field(
        default=None,
        description="WHERE clause conditions"
    )
    limit: Optional[int] = Field(
        default=100,
        description="Maximum number of rows to return",
        ge=1,
        le=10000
    )''',
        "execute_method": '''        """Execute database query."""
        # Note: In production, use proper SQL libraries with parameterized queries
        # This is a simplified example

        self.log(f"Executing {self.config.query_type} query on {self.config.table}")

        # Mock database response
        # In production, use: import psycopg2, mysql.connector, or sqlalchemy

        mock_results = [
            {"id": 1, "name": "Example Row 1", "value": 100},
            {"id": 2, "name": "Example Row 2", "value": 200},
        ]

        self.log(f"Query returned {len(mock_results)} rows")

        return AgentExecutionResult(
            success=True,
            output={
                "results": mock_results,
                "row_count": len(mock_results),
                "query_type": self.config.query_type
            },
            tokens_used=0,
            cost=0.0
        )''',
        "imports": ""
    },

    "webhook": {
        "name": "Webhook Agent",
        "description": "Send data to webhook endpoints",
        "category": "action",
        "config_fields": '''webhook_url: str = Field(
        description="Webhook URL to send data to"
    )
    method: str = Field(
        default="POST",
        description="HTTP method",
        json_schema_extra={"enum": ["POST", "PUT"]}
    )
    headers: Optional[Dict[str, str]] = Field(
        default=None,
        description="Custom headers to include"
    )
    secret: Optional[str] = Field(
        default=None,
        description="Webhook secret for signature"
    )
    retry_on_failure: bool = Field(
        default=True,
        description="Whether to retry on failure"
    )
    max_retries: int = Field(
        default=3,
        description="Maximum number of retries",
        ge=1,
        le=10
    )''',
        "execute_method": '''        """Send data to webhook."""
        import httpx
        import hashlib
        import hmac

        self.log(f"Sending webhook to {self.config.webhook_url}")

        headers = self.config.headers or {}
        headers["Content-Type"] = "application/json"

        # Add signature if secret provided
        if self.config.secret:
            import json
            payload = json.dumps(input_data)
            signature = hmac.new(
                self.config.secret.encode(),
                payload.encode(),
                hashlib.sha256
            ).hexdigest()
            headers["X-Webhook-Signature"] = signature

        # Send with retries
        async with httpx.AsyncClient() as client:
            for attempt in range(self.config.max_retries):
                try:
                    response = await client.request(
                        method=self.config.method,
                        url=self.config.webhook_url,
                        json=input_data,
                        headers=headers,
                        timeout=30.0
                    )
                    response.raise_for_status()

                    self.log(f"Webhook sent successfully: {response.status_code}")

                    return AgentExecutionResult(
                        success=True,
                        output={
                            "status_code": response.status_code,
                            "response": response.text,
                            "attempts": attempt + 1
                        },
                        tokens_used=0,
                        cost=0.0
                    )

                except httpx.HTTPError as e:
                    if attempt < self.config.max_retries - 1 and self.config.retry_on_failure:
                        self.log(f"Attempt {attempt + 1} failed, retrying...", level="WARN")
                        continue
                    else:
                        self.log(f"Webhook failed after {attempt + 1} attempts", level="ERROR")
                        return AgentExecutionResult(
                            success=False,
                            output={"error": str(e), "attempts": attempt + 1},
                            error=str(e)
                        )''',
        "imports": "import httpx\nimport hashlib\nimport hmac"
    },

    "file_processor": {
        "name": "File Processor Agent",
        "description": "Process files (CSV, JSON, Excel) and extract data",
        "category": "data_retrieval",
        "config_fields": '''file_type: str = Field(
        description="Type of file to process",
        json_schema_extra={"enum": ["csv", "json", "excel", "txt"]}
    )
    file_path: Optional[str] = Field(
        default=None,
        description="Path to file (local or URL)"
    )
    encoding: str = Field(
        default="utf-8",
        description="File encoding"
    )
    skip_rows: int = Field(
        default=0,
        description="Number of rows to skip (for CSV/Excel)",
        ge=0
    )
    columns: Optional[list] = Field(
        default=None,
        description="Specific columns to extract"
    )''',
        "execute_method": '''        """Process file and extract data."""
        import pandas as pd

        self.log(f"Processing {self.config.file_type} file")

        try:
            # Read file based on type
            if self.config.file_type == "csv":
                df = pd.read_csv(
                    self.config.file_path,
                    encoding=self.config.encoding,
                    skiprows=self.config.skip_rows
                )
            elif self.config.file_type == "json":
                df = pd.read_json(self.config.file_path)
            elif self.config.file_type == "excel":
                df = pd.read_excel(
                    self.config.file_path,
                    skiprows=self.config.skip_rows
                )
            else:  # txt
                with open(self.config.file_path, 'r', encoding=self.config.encoding) as f:
                    content = f.read()
                    return AgentExecutionResult(
                        success=True,
                        output={"content": content, "type": "text"},
                        tokens_used=0,
                        cost=0.0
                    )

            # Filter columns if specified
            if self.config.columns:
                df = df[self.config.columns]

            # Convert to records
            records = df.to_dict('records')

            self.log(f"Processed {len(records)} records")

            return AgentExecutionResult(
                success=True,
                output={
                    "records": records,
                    "count": len(records),
                    "columns": list(df.columns)
                },
                tokens_used=0,
                cost=0.0
            )

        except Exception as e:
            self.log(f"File processing failed: {str(e)}", level="ERROR")
            return AgentExecutionResult(
                success=False,
                output={"error": str(e)},
                error=str(e)
            )''',
        "imports": "import pandas as pd"
    },

    "llm_processor": {
        "name": "LLM Processor Agent",
        "description": "Use LLM to analyze, summarize, or transform data",
        "category": "analysis",
        "config_fields": '''task_type: str = Field(
        description="Type of LLM task",
        json_schema_extra={"enum": ["summarize", "extract", "classify", "transform", "generate"]}
    )
    model: str = Field(
        default="gpt-4",
        description="LLM model to use"
    )
    prompt_template: Optional[str] = Field(
        default=None,
        description="Custom prompt template (use {input} placeholder)"
    )
    temperature: float = Field(
        default=0.7,
        description="Model temperature (0-1)",
        ge=0.0,
        le=1.0
    )
    max_tokens: int = Field(
        default=1000,
        description="Maximum tokens in response",
        ge=1,
        le=4000
    )''',
        "execute_method": '''        """Process data with LLM."""
        from openai import AsyncOpenAI

        self.log(f"Processing with LLM: {self.config.task_type}")

        # Build prompt based on task type
        if self.config.prompt_template:
            prompt = self.config.prompt_template.format(input=input_data)
        else:
            task_prompts = {
                "summarize": f"Summarize the following data concisely:\\n\\n{input_data}",
                "extract": f"Extract key information from:\\n\\n{input_data}",
                "classify": f"Classify the following data:\\n\\n{input_data}",
                "transform": f"Transform the following data as needed:\\n\\n{input_data}",
                "generate": f"Generate content based on:\\n\\n{input_data}"
            }
            prompt = task_prompts.get(self.config.task_type, str(input_data))

        # Call LLM (mock for demo)
        # In production: client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        mock_response = f"LLM {self.config.task_type} result for the provided data."
        mock_tokens = 250

        self.log(f"LLM processing complete")

        return AgentExecutionResult(
            success=True,
            output={
                "result": mock_response,
                "task_type": self.config.task_type,
                "model": self.config.model
            },
            tokens_used=mock_tokens,
            cost=mock_tokens * 0.00003  # Rough GPT-4 pricing
        )''',
        "imports": "# from openai import AsyncOpenAI  # Uncomment in production"
    }
}


def list_templates():
    """List all available templates."""
    print("\n📦 Available Agent Templates\n")
    for template_id, template in TEMPLATES.items():
        print(f"{template_id:20} - {template['name']}")
        print(f"{'':20}   {template['description']}")
        print(f"{'':20}   Category: {template['category']}")
        print()


def get_template(template_id: str) -> dict:
    """Get template by ID."""
    return TEMPLATES.get(template_id)


if __name__ == "__main__":
    list_templates()
